import { FastifyReply, FastifyRequest } from "fastify";
import { minioClient, minioConfig } from "../config/minio";
import { UserFile } from "../models/userFile";
import { getSession } from "../lib/session";

// Add an util to check if the user has enough space in their plan
export const handleAddFileToBucket = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Obtener la sesión del usuario
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Unauthrized" });
  }

  // Obtener el archivo del request
  const file = await (request as any).file?.();
  if (!file) {
    return reply.status(400).send({ message: "No file uploaded" });
  }

  // Validar bucket
  if (!minioConfig.bucket) {
    return reply.status(500).send({ message: "Bucket is not configured" });
  }

  try {
    // Generar nombre único para el archivo
    const fileName = `${session.id}-${Date.now()}-${file.filename}`;

    // Subir archivo a MinIO
    await minioClient.putObject(
      minioConfig.bucket,
      fileName,
      file.file,
      undefined,
      { "Content-Type": file.mimetype }
    );

    // Construir la URL del archivo
    const fileUrl = `https://${minioConfig.endPoint}/${minioConfig.bucket}/${fileName}`;

    // Guardar referencia en MongoDB
    await UserFile.create({
      userId: session.id,
      fileName,
      fileUrl
    });

    return reply.status(201).send({
      message: "File uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Error uploading file" });
  }
};

export const handleFileRenaming = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Obtener la sesión del usuario
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  // Obtener el nuevo nombre del archivo y el ID del archivo a renombrar
  const { newFileName, fileId } = request.body as { newFileName: string; fileId: string };
  if (!newFileName || !fileId) {
    return reply.status(400).send({ message: "New file name and file ID are required" });
  }

  try {
    // Buscar el archivo en MongoDB
    const userFile = await UserFile.findOne({ _id: fileId, userId: session.id });
    if (!userFile) {
      return reply.status(404).send({ message: "File not found" });
    }

    if (userFile.userId !== session.id) {
      return reply.status(403).send({ message: "Forbidden: You do not own this file" });
    }

    // Renombrar el archivo en MinIO (copiar y borrar)
    const oldFileName = userFile.fileName;
    const newFileNameWithUser = `${session.id}-${Date.now()}-${newFileName}`;

    // Copiar el archivo al nuevo nombre
    await minioClient.copyObject(
      minioConfig.bucket!,
      newFileNameWithUser,
      `/${minioConfig.bucket}/${oldFileName}`
    );

    // Borrar el archivo original
    await minioClient.removeObject(minioConfig.bucket!, oldFileName);

    // Actualizar la referencia en MongoDB
    const newFileUrl = `https://${minioConfig.endPoint}/${minioConfig.bucket}/${newFileNameWithUser}`;
    userFile.fileName = newFileNameWithUser;
    userFile.fileUrl = newFileUrl;
    await userFile.save();

    return reply.status(200).send({
      message: "File renamed successfully",
      fileUrl: newFileUrl,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Error renaming file" });
  }
};

export const handleFileDeletion = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Obtener la sesión del usuario
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  // Obtener el ID del archivo a eliminar
  const { fileId } = request.body as { fileId: string };
  if (!fileId) {
    return reply.status(400).send({ message: "File ID is required" });
  }

  try {
    // Buscar el archivo en MongoDB
    const userFile = await UserFile.findOne({ _id: fileId, userId: session.id });
    if (!userFile) {
      return reply.status(404).send({ message: "File not found" });
    }

    if (userFile.userId !== session.id) {
      return reply.status(403).send({ message: "Forbidden: You do not own this file" });
    }

    // Eliminar el archivo de MinIO
    await minioClient.removeObject(minioConfig.bucket!, userFile.fileName);

    // Eliminar la referencia en MongoDB
    await UserFile.deleteOne({ _id: fileId });

    return reply.status(200).send({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Error deleting file" });
  }
};

export const handleGetFiles = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Obtener la sesión del usuario
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    // Obtener los archivos del usuario desde MongoDB
    const userFiles = await UserFile.find({ userId: session.id });

    return reply.status(200).send(userFiles);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Error retrieving files" });
  }
};

export const handleDownloadFile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const { fileId } = request.params as { fileId: string };
  if (!fileId) {
    return reply.status(400).send({ message: "File ID is required" });
  }

  try {
    const userFile = await UserFile.findOne({ _id: fileId, userId: session.id });
    if (!userFile) {
      return reply.status(404).send({ message: "File not found" });
    }

    // Get file stream from MinIO
    const fileStream = await minioClient.getObject(minioConfig.bucket!, userFile.fileName);

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="${userFile.fileName}"`);
    return reply.send(fileStream);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Error downloading file" });
  }
};
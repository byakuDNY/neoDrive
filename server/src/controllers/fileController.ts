import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { envConfig } from "../lib/envConfig";
import { s3Client } from "../lib/s3Client";
import {
  deleteFileSchema,
  favoriteFileSchema,
  fileMetadataSchema,
  presignedUrlSchema,
  renameFileSchema,
} from "../lib/schemas";
import { getSession } from "../lib/session";
import { calculateUsedStorage, SUBSCRIPTION_LIMITS } from "../lib/utils";
import { File } from "../models/fileModel";

export const handleGetFiles = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const files = await File.find({ userId: session.id });

    const filesWithUrls = files.map((file) => {
      let url = null;

      // Only generate URLs for actual files (not folders)
      if (file.type === "file" && file.s3Key) {
        url = `http://localhost:9000/${envConfig.S3_BUCKET}/${file.s3Key}`;
      }

      return {
        ...file.toObject(),
        url,
      };
    });

    return reply.status(200).send({
      message: "Files retrieved successfully",
      filesWithUrls,
    });
  } catch (error) {
    console.error("Error retrieving files:", error);
    return reply.status(500).send({
      message: "Failed to retrieve files",
    });
  }
};
export const handlePresignedUrl = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = presignedUrlSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const usedStorage = await calculateUsedStorage(session.id);
    const storageLimit =
      SUBSCRIPTION_LIMITS[
        session.subscription as keyof typeof SUBSCRIPTION_LIMITS
      ];

    if (usedStorage + data.size > storageLimit) {
      return reply.status(403).send({
        message:
          "Storage limit exceeded. Please upgrade your subscription or delete some files.",
      });
    }
  } catch (error) {
    console.error("Error checking storage usage:", error);
    return reply.status(500).send({
      message: "Failed to check storage usage",
    });
  }

  const uniqueKey = `${session.id}${data.path}${data.name}`;

  try {
    const command = new PutObjectCommand({
      Bucket: envConfig.S3_BUCKET,
      Key: uniqueKey,
      ContentType: data.mimeType,
      ContentLength: data.size,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 30, // URL expires in 30 minutes
    });

    return reply.status(200).send({
      presignedUrl,
      uniqueKey,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return reply.status(500).send({
      message: "Failed to generate presigned URL",
    });
  }
};
export const handleStoreFileMetadata = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = fileMetadataSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const existingFile = await File.findOne({ name: data.name });
    if (existingFile) {
      return reply.status(409).send({
        message: "File already exists",
      });
    }

    data.id = `${ulid()}_${data.name}`;

    await File.create(data);

    return reply.status(201).send({
      message: "File metadata saved successfully",
    });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    return reply.status(500).send({
      message: "Failed to save file metadata",
    });
  }
};

export const handleRenameFile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = renameFileSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const file = await File.findOne({ id: data.id });
    if (!file) {
      return reply.status(404).send({ message: "File not found" });
    }

    // Update database record
    const updateDatabasePromise = File.updateOne(
      { id: data.id },
      { name: data.name }
    );

    // Update S3 object if it exists (copy to new name, then delete old)
    let updateS3Promise: Promise<any> = Promise.resolve();
    if (file.s3Key && file.type === "file") {
      // Generate new S3 key with new filename
      const newKey = `${session.id}_${ulid()}${file.path}${data.name}`;

      const copyCommand = new CopyObjectCommand({
        Bucket: envConfig.S3_BUCKET,
        CopySource: `${envConfig.S3_BUCKET}/${file.s3Key}`,
        Key: newKey,
      });

      const deleteCommand = new DeleteObjectCommand({
        Bucket: envConfig.S3_BUCKET,
        Key: file.s3Key,
      });

      updateS3Promise = s3Client.send(copyCommand).then(() => {
        // Update the database with the new S3 key
        return Promise.all([
          s3Client.send(deleteCommand),
          File.updateOne({ id: data.id }, { s3Key: newKey }),
        ]);
      });
    }

    await Promise.all([updateDatabasePromise, updateS3Promise]);

    return reply.status(200).send({
      message: "File renamed successfully",
    });
  } catch (error) {
    console.error("Error renaming file: ", error);
    return reply.status(500).send({
      message: "Failed to rename file",
    });
  }
};

export const handleFavoriteFile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = favoriteFileSchema.safeParse(request.body);
  if (!success || data.type !== "file") {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    await File.findOneAndUpdate(
      { id: data.id },
      { isFavorited: !data.isFavorited }
    );

    return reply.status(200).send({
      message: "File favorited successfully",
    });
  } catch (error) {
    console.error("Error favorite file:", error);
    return reply.status(500).send({
      message: "Failed to favorite file",
    });
  }
};

export const handleDeleteFile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = deleteFileSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const fileToDelete = await File.findOne({ id: data.id });
    if (!fileToDelete) {
      return reply.status(404).send({ message: "File not found" });
    }

    // If it's a folder, check if it contains any files
    if (fileToDelete.type === "folder") {
      const filesInFolder = await File.find({
        userId: session.id,
        path: `${fileToDelete.path}${fileToDelete.name}/`,
      });

      if (filesInFolder.length > 0) {
        return reply.status(400).send({
          message:
            "Cannot delete folder that contains files. Please delete all files inside the folder first.",
        });
      }
    }

    const deleteFilePromise = File.findOneAndDelete({ id: data.id });

    let deleteS3Promise: Promise<any> = Promise.resolve();
    if (data.s3Key && data.type === "file") {
      const command = new DeleteObjectCommand({
        Bucket: envConfig.S3_BUCKET,
        Key: data.s3Key,
      });
      deleteS3Promise = s3Client.send(command);
    }

    await Promise.all([deleteFilePromise, deleteS3Promise]);

    return reply.status(200).send({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return reply.status(500).send({
      message: "Failed to delete file",
    });
  }
};

export const handleGetStorageUsage = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  try {
    const usedStorage = await calculateUsedStorage(session.id);
    const storageLimit =
      SUBSCRIPTION_LIMITS[
        session.subscription as keyof typeof SUBSCRIPTION_LIMITS
      ];

    return reply.status(200).send({
      message: "Storage usage retrieved successfully",
      data: {
        usedStorage,
        storageLimit,
        remainingStorage: storageLimit - usedStorage,
        usagePercentage: Math.round((usedStorage / storageLimit) * 100),
        subscription: session.subscription,
      },
    });
  } catch (error) {
    console.error("Error getting storage usage:", error);
    return reply.status(500).send({
      message: "Failed to get storage usage",
    });
  }
};

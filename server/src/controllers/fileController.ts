import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { SUBSCRIPTION_LIMITS } from "../lib/constants";
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
import { calculateUsedStorage, validateSession } from "../lib/utils";
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

      if (file.type === "file" && file.s3Key) {
        url = `${envConfig.S3_ENDPOINT}/${envConfig.S3_BUCKET}/${file.s3Key}`;
      }

      return {
        ...file.toObject(),
        url,
      };
    });

    return reply.status(200).send({
      message: "Files fetched successfully",
      data: {
        files: filesWithUrls,
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return reply.status(500).send({
      message: "Failed to fetch files",
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

  const validation = await validateSession(request, reply, data.userId);
  if (!validation) return;

  const { session } = validation;

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
      message: "Presigned URL generated successfully",
      data: {
        presignedUrl,
        uniqueKey,
      },
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

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const { session } = validation;

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

  try {
    const existingFile = await File.findOne({
      name: data.name,
      userId: data.userId,
    });
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

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;
    const { session } = validation;

    const file = await File.findOne({ id: data.id, userId: data.userId });
    if (!file) {
      return reply.status(404).send({ message: "File not found" });
    }

    const updateData = { name: data.name, s3Key: "" };

    if (file.s3Key && file.type === "file") {
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

      await s3Client.send(copyCommand);
      await s3Client.send(deleteCommand);

      updateData.s3Key = newKey;
    }

    await File.updateOne({ id: data.id, userId: data.userId }, updateData);

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

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const file = await File.findOneAndUpdate(
      { id: data.id, userId: data.userId },
      { isFavorited: !data.isFavorited }
    );
    if (!file) {
      return reply.status(404).send({ message: "File not found" });
    }

    return reply.status(200).send({
      message: `File to ${
        data.isFavorited ? "unfavorited" : "favorited"
      } successfully`,
    });
  } catch (error) {
    console.error(
      `Error to ${data.isFavorited ? "unfavorite" : "favorite"} file:`,
      error
    );
    return reply.status(500).send({
      message: `Failed to ${data.isFavorited ? "unfavorite" : "favorite"} file`,
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

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const fileToDelete = await File.findOne({
      id: data.id,
      userId: data.userId,
    });
    if (!fileToDelete) {
      return reply.status(404).send({ message: "File not found" });
    }

    // If it's a folder, check if it contains any files
    if (!data.s3Key && fileToDelete.type === "folder") {
      const filesInFolder = await File.find({
        userId: data.userId,
        path: `${fileToDelete.path}${fileToDelete.name}/`,
      });

      if (filesInFolder.length > 0) {
        return reply.status(400).send({
          message:
            "Cannot delete folder that contains files. Please delete all files inside the folder first.",
        });
      }
    }

    if (data.s3Key && data.type === "file") {
      const command = new DeleteObjectCommand({
        Bucket: envConfig.S3_BUCKET,
        Key: data.s3Key,
      });
      await s3Client.send(command);
    }

    await File.findOneAndDelete({
      id: data.id,
      userId: data.userId,
    });

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

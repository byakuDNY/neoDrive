import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { envConfig } from "../lib/envConfig";
import { s3Client } from "../lib/s3Client";
import { fileMetadataSchema, presignedUrlSchema } from "../lib/schemas";
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

  const uniqueKey = `${session.id}${data.path}`;

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

  if (data.userId !== session.id) {
    return reply.status(403).send({ message: "You do not own this file" });
  }

  data.id = `${ulid()}-${data.name}`;

  try {
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

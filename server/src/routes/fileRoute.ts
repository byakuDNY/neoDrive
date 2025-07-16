import { FastifyInstance } from "fastify";
import {
  handleGetFiles,
  handleGetStorageUsage,
  handlePresignedUrl,
  handleStoreFileMetadata,
} from "../controllers/fileController";
import { File } from "../models/fileModel";

export const fileRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", handleGetFiles);
  fastify.post("/presignedUrl", handlePresignedUrl);
  fastify.post("/uploadFileMetadata", handleStoreFileMetadata);
  fastify.get("/getStorageUsage", handleGetStorageUsage);

  fastify.delete("/debug/files", async () => {
    return await File.deleteMany({});
  });
};

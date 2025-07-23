import { FastifyInstance } from "fastify";
import {
  handleDeleteFile,
  handleFavoriteFile,
  handleGetFiles,
  handleGetStorageUsage,
  handlePresignedUrl,
  handleRenameFile,
  handleStoreFileMetadata,
} from "../controllers/fileController";

export const fileRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/", handleGetFiles);
  fastify.get("/getStorageUsage", handleGetStorageUsage);

  fastify.post("/presignedUrl", handlePresignedUrl);
  fastify.post("/uploadFileMetadata", handleStoreFileMetadata);
  fastify.post("/renameFile", handleRenameFile);
  fastify.post("/toggleFavorite", handleFavoriteFile);

  fastify.delete("/", handleDeleteFile);
};

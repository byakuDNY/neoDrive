import { FastifyInstance } from "fastify";
import { handleNameChange, handlePasswordChange } from "../controllers/userController";

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.patch("/name", handleNameChange);
    fastify.patch("/password", handlePasswordChange);
}
import { FastifyInstance } from "fastify";
import { handleNameChange, handlePasswordChange } from "../controllers/user";

export const userRoutes = async (fastify: FastifyInstance) => {
    fastify.patch("/name", handleNameChange);
    fastify.patch("/password", handlePasswordChange);
}
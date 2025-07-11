import { FastifyInstance } from "fastify";
import { handleCreateCheckoutSession, handleCreateProduct } from "../controllers/stripe";

export const stripeRoutes = async (fastify: FastifyInstance) => {
    fastify.post("/create", handleCreateProduct);
    fastify.post("/checkout", handleCreateCheckoutSession);
}
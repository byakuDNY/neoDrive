import { FastifyInstance } from "fastify";
import { handleCancelSubscription, handleCreateCheckoutSession, handleCreateProduct } from "../controllers/stripeController";

export const stripeRoutes = async (fastify: FastifyInstance) => {
    fastify.post("/create", handleCreateProduct);
    fastify.post("/checkout", handleCreateCheckoutSession);
    fastify.post("/cancel", handleCancelSubscription)
}
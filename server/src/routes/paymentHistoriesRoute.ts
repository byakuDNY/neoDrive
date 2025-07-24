import { FastifyInstance } from "fastify";
import { getPaymentHistories } from "../controllers/paymentHistoryController";

export const paymentHistoryRoutes = async (fastify: FastifyInstance) => {
    fastify.get("/", getPaymentHistories)
}
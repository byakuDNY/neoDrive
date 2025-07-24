import { FastifyReply, FastifyRequest } from "fastify";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";

export const getPaymentHistories = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try{
        const paymentHistories = await UserPaymentHistory.find()
            .populate('subscriptionId', 'name price') // Populate subscription details
            .sort({ paymentDate: -1 }); // Sort by most recent first
        
        return reply.status(200).send({
            message: "Payment histories retrieved successfully",
            data: paymentHistories
        });
    }catch (error) {
        console.error("Error fetching payment histories:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
}
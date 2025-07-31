import { FastifyReply, FastifyRequest } from "fastify";
import { getAdminSession } from "../lib/session";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";

export const getPaymentHistories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const session = getAdminSession(request);
    if (!session) {
      return reply.status(401).send({ message: "Invalid session" });
    }

    const paymentHistories = await UserPaymentHistory.find()
      .populate("subscriptionId", "name price") // Populate subscription details
      .sort({ paymentDate: -1 }); // Sort by most recent first

    return reply.status(200).send({
      message: "Payment histories retrieved successfully",
      data: paymentHistories,
    });
  } catch (error) {
    console.error("Error fetching payment histories:", error);
    return reply
      .status(500)
      .send({ message: "Failed to fetch payment histories" });
  }
};

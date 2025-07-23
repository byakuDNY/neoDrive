import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import stripe from "stripe";
import { handleCancelledCheckout, handleCompletedCheckout } from "../lib/stripe";

dotenv.config();

export const handleWebhooks = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const sig = request.headers['stripe-signature'];
  if (!sig) {
    return reply.status(400).send({ message: "Missing stripe signature" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body as  Buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (error) {
    return reply.status(400).send({ message: "Invalid signature" });
  }
  try {
    switch(event.type){
      case 'checkout.session.completed':
        await handleCompletedCheckout(event.data.object)
        return reply.status(200).send({ message: "Checkout session completed" });
      case 'customer.subscription.updated':

      case 'invoice.payment_succeeded':
        

    }
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}

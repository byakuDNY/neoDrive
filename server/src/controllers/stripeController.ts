import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import stripe from "stripe";
import { getSession } from "../lib/session";
import {
  createCheckoutSessionSchema,
  createProductSchema,
} from "../lib/schemas";
import { User } from "../models/userModel";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";
import { Subscription } from "../models/subscriptionsModel";
dotenv.config();

const stripeClient = new stripe(
  process.env.STRIPE_SECRET_KEY ||
  (() => {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in environment variables"
    );
  })()
);

export const handleCreateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = createProductSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid product creation data" });
  }
  try {
    const product = await stripeClient.products.create({
      name: data.name,
      default_price_data: {
        currency: "usd",
        unit_amount: Math.round(data.price * 100),
        recurring: {
          interval: "month",
        },
      },
    });
    const subscription = await Subscription.create({
      name: data.name,
      price: data.price,
      stripeId: product.default_price,
    });

    return reply.status(201).send({
      message: "Product created successfully",
      product: {
        id: subscription._id,
        name: product.name,
        price: data.price,
        stripeId: product.default_price,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const handleCreateCheckoutSession = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = createCheckoutSessionSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid checkout session data" });
  }
  try {
    const userSession = getSession(request);
    if (!userSession) {
      return reply.status(401).send({ message: "Invalid session" });
    }
    const user = await User.findOne({ id: userSession.id });
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const subscription = await Subscription.findOne({ name: data.product });
    if (!subscription) {
      return reply.status(404).send({ message: "Subscription not found" });
    }

    if (user.subscription == subscription.name) {
      return reply.status(400).send({ message: "User already subscribed to this plan" });
    }

    const Stripesession = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: subscription.stripeId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.cancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        product: subscription.name,
      },
    });
    await UserPaymentHistory.create({
      userId: user.id,
      subscriptionId: subscription._id.toString(),
      stripeSessionId: Stripesession.id,
      amount: subscription.price,
      status: "pending",
    });
    return reply.status(200).send({ url: Stripesession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};
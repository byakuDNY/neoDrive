import { FastifyReply, FastifyRequest } from "fastify";
import {
  createCheckoutSessionSchema,
  createProductSchema,
} from "../lib/schemas";
import { getSession, updateSession } from "../lib/session";
import { stripeClient } from "../lib/stripe";
import { validateSession } from "../lib/utils";
import { Subscription } from "../models/subscriptionsModel";
import { SubscriptionPlan, User } from "../models/userModel";

export const handleCreateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = createProductSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
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
    return reply.status(500).send({ message: "Failed to create product" });
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
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const subscription = await Subscription.findOne({ name: data.product });
    if (!subscription) {
      return reply.status(404).send({ message: "Subscription not found" });
    }

    const { user } = validation;
    if (user.subscription == subscription.name) {
      return reply
        .status(400)
        .send({ message: "User already subscribed to this plan" });
    }

    // handle upgrade from Pro to Premium
    if (user.subscription == "Pro" && subscription.name == "Premium") {
      if (!user.subscriptionId) {
        return reply
          .status(400)
          .send({ message: "No active subscription found for upgrade" });
      }

      try {
        const currentSubscription = await stripeClient.subscriptions.retrieve(
          user.subscriptionId
        );
        const updatedSubscription = await stripeClient.subscriptions.update(
          user.subscriptionId,
          {
            items: [
              {
                id: currentSubscription.items.data[0].id,
                price: subscription.stripeId,
              },
            ],
            proration_behavior: "create_prorations",
          }
        );

        user.subscription = "Premium";
        await user.save();

        updateSession(user.id, {
          subscription: subscription.name as SubscriptionPlan,
        });
        return reply.status(200).send({
          message: "Subscription updated successfully",
          subscription: updatedSubscription,
        });
      } catch (stripeError) {
        console.error("Stripe error during subscription update:", stripeError);
        return reply
          .status(500)
          .send({ message: "Failed to update subscription" });
      }
    }
    // Handle downgrade from Premium to Pro
    if (user.subscription == "Premium" && subscription.name == "Pro") {
      if (!user.subscriptionId) {
        return reply
          .status(400)
          .send({ message: "No active subscription found for downgrade" });
      }

      try {
        const currentSubscription = await stripeClient.subscriptions.retrieve(
          user.subscriptionId
        );
        await stripeClient.subscriptions.update(user.subscriptionId, {
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: subscription.stripeId,
            },
          ],
          proration_behavior: "none",
          metadata: {
            ...currentSubscription.metadata,
            pending_downgrade: "true",
            downgrade_to: subscription.stripeId,
          },
        });

        return reply
          .status(200)
          .send({ message: "Subscription downgrade scheduled successfully" });
      } catch (error) {
        console.error("Error during subscription downgrade:", error);
        return reply
          .status(500)
          .send({ message: "Failed to downgrade subscription" });
      }
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
      success_url: `${data.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.cancelUrl}&session_id={CHECKOUT_SESSION_ID}`,
      customer: user.stripeCustomerId,
      metadata: {
        userId: user.id,
        product: subscription.name,
      },
    });

    return reply.status(200).send({ url: Stripesession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const handleCancelSubscription = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userSession = getSession(request);
    if (!userSession) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
    const user = await User.findOne({ id: userSession.id });
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }
    if (!user.subscriptionId) {
      return reply
        .status(400)
        .send({ message: "No active subscription found" });
    }
    const subscription = await stripeClient.subscriptions.retrieve(
      user.subscriptionId
    );
    if (!subscription) {
      return reply.status(404).send({ message: "Subscription not found" });
    }
    await stripeClient.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });
    console.log("Subscription cancellation scheduled successfully");
    return reply
      .status(200)
      .send({ message: "Subscription cancellation scheduled successfully" });
  } catch (error) {
    console.error("Error processing cancelled subscription:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

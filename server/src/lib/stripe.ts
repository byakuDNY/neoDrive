import Stripe from "stripe";
import { Subscription } from "../models/subscriptionsModel";
import { SubscriptionPlan, User } from "../models/userModel";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";
import { envConfig } from "./envConfig";
import { updateSession } from "./session";

export const stripeClient = new Stripe(envConfig.STRIPE_SECRET_KEY);

export const handleCompletedCheckout = async (
  session: Stripe.Checkout.Session
) => {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error("No user ID found in session metadata");
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const subscription = session.metadata?.product;
    if (!subscription) {
      throw new Error("No subscription found in session metadata");
    }

    const allowedSubscriptions: SubscriptionPlan[] = ["Free", "Pro", "Premium"];
    if (!allowedSubscriptions.includes(subscription as SubscriptionPlan)) {
      throw new Error(`Invalid subscription type: ${subscription}`);
    }
    const subscriptionPlan = await Subscription.findOne({ name: subscription });
    if (!subscriptionPlan) {
      throw new Error(`Subscription plan not found: ${subscription}`);
    }
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    user.subscription = subscription as SubscriptionPlan;
    user.SubscriptionEndDate = subscriptionEndDate;
    user.subscriptionId = session.subscription as string;
    await user.save();
    updateSession(user.id, { subscription: subscription as SubscriptionPlan });
  } catch (error) {
    console.error("Error processing completed checkout:", error);
  }
};

export const handleInvoicePaymentSucceeded = async (
  invoice: Stripe.Invoice
) => {
  try {
    const user = await User.findOne({
      stripeCustomerId: invoice.customer as string,
    });
    if (!user) {
      throw new Error("No user ID found in invoice metadata");
    }
    // Update the user's subscription if a downgrade is pending
    const stripeSubscription = await stripeClient.subscriptions.retrieve(
      user.subscriptionId as string
    );
    if (stripeSubscription.metadata.pending_downgrade === "true") {
      const downgradeTo = stripeSubscription.metadata.downgrade_to;
      const downgradedSubscription = await Subscription.findOne({
        stripeId: downgradeTo,
      });
      if (!downgradedSubscription) {
        throw new Error(`Downgrade subscription not found: ${downgradeTo}`);
      }
      user.subscription = downgradedSubscription.name as SubscriptionPlan;
      await stripeClient.subscriptions.update(user.subscriptionId as string, {
        metadata: {
          ...stripeSubscription.metadata,
          pending_downgrade: null,
          downgrade_to: null,
        },
      });
    }
    const subscription = await Subscription.findOne({
      name: user.subscription,
    });
    if (!subscription) {
      throw new Error(`Subscription plan not found: ${user.subscription}`);
    }
    const paymentDate = new Date();
    await UserPaymentHistory.create({
      userId: user.id,
      subscriptionId: subscription?._id.toString(),
      amount: invoice.amount_paid / 100,
      paymentDate: paymentDate,
    });
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    user.SubscriptionEndDate = subscriptionEndDate;
    await user.save();
  } catch (error) {
    console.error("Error processing invoice payment succeeded:", error);
  }
};

export const handleCancelledSubscription = async (
  subscription: Stripe.Subscription
) => {
  try {
    const customerId = subscription.customer;
    const user = await User.findOne({ stripeCustomerId: customerId as string });
    if (!user) {
      throw new Error(`User not found for customer ID: ${customerId}`);
    }
    user.subscription = "Free";
    user.SubscriptionEndDate = null;
    user.subscriptionId = null;
    await user.save();
  } catch (error) {
    console.error("Error processing cancelled subscription:", error);
  }
};

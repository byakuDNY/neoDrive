import Stripe from "stripe";
import { SubscriptionPlan, User } from "../models/userModel";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";
import { Subscription } from "../models/subscriptionsModel";

export const handleCompletedCheckout = async (session: Stripe.Checkout.Session) => {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error('No user ID found in session metadata');
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const subscription = session.metadata?.product
    if (!subscription) {
      throw new Error('No subscription found in session metadata');
    }

    const allowedSubscriptions: SubscriptionPlan[] = ['Free', 'Pro', 'Premium'];
    if (!allowedSubscriptions.includes(subscription as SubscriptionPlan)) {
      throw new Error(`Invalid subscription type: ${subscription}`);
    }
    const subscriptionPlan = await Subscription.findOne({ name: subscription });
    if (!subscriptionPlan) {
      throw new Error(`Subscription plan not found: ${subscription}`);
    }
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    await UserPaymentHistory.create({
      userId: user.id,
      subscriptionId: subscriptionPlan._id.toString(),
      amount: subscriptionPlan.price
    });
    user.subscription = subscription as SubscriptionPlan;
    user.SubscriptionEndDate = subscriptionEndDate;
    user.subscriptionId = session.subscription as string;
    await user.save();
  } catch (error) {
    console.error('Error processing completed checkout:', error);
    throw error;
  }
};

export const handleInvoicePaymentSucceeded = async (session: Stripe.Invoice) => {
  try {
    const user = await User.findOne({ stripeCustomerId: session.customer as string });
    if (!user) {
      throw new Error('No user ID found in invoice metadata');
    }
    const subscription = await Subscription.findOne({ name: user.subscription });
    if (!subscription) {
      throw new Error(`Subscription plan not found: ${user.subscription}`);
    }
    const paymentDate = new Date();
    await UserPaymentHistory.create({
      userId: user.id,
      subscriptionId: subscription?._id.toString(),
      amount: session.amount_paid / 100,
      paymentDate: paymentDate
    });
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    user.SubscriptionEndDate = subscriptionEndDate;
    await user.save();
  } catch (error) {
    console.error('Error processing invoice payment succeeded:', error);
    throw error;
  }
}
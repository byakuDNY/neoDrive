import Stripe from "stripe";
import { SubscriptionPlan, User } from "../models/userModel";
import { UserPaymentHistory } from "../models/userPaymentHistoryModel";

export const handleCompletedCheckout = async (session: Stripe.Checkout.Session) => {
  try {
    console.log('Processing completed checkout:', session.id);

    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error('No user ID found in session metadata');
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const paymentHistory = await UserPaymentHistory.findOne({
      stripeSessionId: session.id,
      status: 'pending'
    });

    if (!paymentHistory) {
      throw new Error(`Payment history not found for session: ${session.id}`);
    }

    const subscription = session.metadata?.product
    if (!subscription) {
      throw new Error('No subscription found in session metadata');
    }

    const allowedSubscriptions: SubscriptionPlan[] = ['Free', 'Pro', 'Premium'];
    if (!allowedSubscriptions.includes(subscription as SubscriptionPlan)) {
      throw new Error(`Invalid subscription type: ${subscription}`);
    }
  
    paymentHistory.status = 'completed';
    user.subscription = subscription as SubscriptionPlan;
    await paymentHistory.save();
    await user.save();
  } catch (error) {
    console.error('Error processing completed checkout:', error);
    throw error;
  }
};

export const handleCancelledCheckout = async (session: Stripe.Checkout.Session) => {
  try {
    console.log('Processing cancelled checkout:', session.id);

    const userId = session.metadata?.userId;
    if (!userId) {
      throw new Error('No user ID found in session metadata');
    }

    const paymentHistory = await UserPaymentHistory.findOne({
      stripeSessionId: session.id,
      status: 'pending'
    });

    if (paymentHistory) {
      paymentHistory.status = 'cancelled';
      await paymentHistory.save();
    }
  } catch (error) {
    console.error('Error processing cancelled checkout:', error);
    throw error;
  }
}
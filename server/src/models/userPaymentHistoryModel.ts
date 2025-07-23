import mongoose from "mongoose";

const userPaymentHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export type IUserPaymentHistory = mongoose.InferSchemaType<typeof userPaymentHistorySchema>;
export const UserPaymentHistory = mongoose.model("UserPaymentHistory", userPaymentHistorySchema);
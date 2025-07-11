import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type ISubscription = mongoose.InferSchemaType<typeof subscriptionSchema>;
export const Subscription = mongoose.model("Subscription", subscriptionSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    salt: {
      type: String,
      required: true,
    },
    subscription: {
      type: String,
      enum: ["Free", "Pro", "Premium"],
      required: true,
    },
    subscriptionId: {
      type: String,
      required: false,
    },
    SubscriptionEndDate: {
      type: Date,
      required: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type IUser = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.Document & IUser;
export type SubscriptionPlan = "Free" | "Pro" | "Premium";
export const User = mongoose.model("User", userSchema);

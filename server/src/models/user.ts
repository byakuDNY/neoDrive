import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
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
      enum: ["free", "pro"],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type IUser = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.Document & IUser;
export const User = mongoose.model("User", userSchema);

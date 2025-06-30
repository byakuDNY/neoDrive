import mongoose from "mongoose";

const userFileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export type IUserFile = mongoose.InferSchemaType<typeof userFileSchema>;
export const UserFile = mongoose.model("UserFile", userFileSchema);
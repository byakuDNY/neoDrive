import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      minLength: 2,
      maxlength: 255,
    },
    s3Key: {
      type: String,
      required: false,
      maxlength: 255,
      default: null,
    },
    userId: {
      type: String,
      required: true,
      minLength: 2,
      maxlength: 255,
    },
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxlength: 255,
    },
    url: {
      type: String,
      required: false,
      maxlength: 255,
      default: null,
    },
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      default: 0,
    },
    mimeType: {
      type: String,
      required: false,
      maxlength: 255,
      default: null,
    },
    path: {
      type: String,
      required: true,
      minLength: 2,
      maxlength: 255,
    },
    isFavorited: {
      type: Boolean,
      required: false,
      default: false,
    },
    category: {
      type: String,
      required: false,
      enum: ["images", "videos", "audio", "documents", "others"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type IFile = mongoose.InferSchemaType<typeof fileSchema>;
export type FileDocument = mongoose.Document & IFile;
export const File = mongoose.model("File", fileSchema);

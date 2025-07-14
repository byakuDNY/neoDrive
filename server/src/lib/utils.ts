import crypto from "crypto";
import { File } from "../models/fileModel";
import { Session } from "./session";

export const hashPassword = (password: string, salt: string) => {
  try {
    const hash = crypto.scryptSync(password.normalize(), salt, 64);
    return hash.toString("hex");
  } catch (error) {
    throw error;
  }
};

export const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const comparePassword = (
  password: string,
  hashedPassword: string,
  salt: string
) => {
  const inputHashedPassword = hashPassword(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(inputHashedPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  );
};

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxFileSize: 30 * 1024 * 1024, // 30MB
    maxTotalStorage: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "application/pdf",
    ],
  },
  pro: {
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    maxTotalStorage: 5 * 1024 * 1024 * 1024, // 5GB
    allowedMimeTypes: null, // null means all types allowed
  },
  premium: {
    maxFileSize: 30 * 1024 * 1024 * 1024, // 30GB
    maxTotalStorage: 100 * 1024 * 1024 * 1024, // 100GB
    allowedMimeTypes: null, // null means all types allowed
  },
};

export const checkSubscriptionLimits = async (
  session: Session,
  fileSize: number,
  mimeType: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const subscriptionPlan = session!.subscription;
  const limits =
    SUBSCRIPTION_LIMITS[subscriptionPlan as keyof typeof SUBSCRIPTION_LIMITS];

  // Check file size limit
  if (fileSize > limits.maxFileSize) {
    return {
      success: false,
      message: "File size exceeds limit",
    };
  }

  // Check mimetype restrictions
  if (limits.allowedMimeTypes && !limits.allowedMimeTypes.includes(mimeType)) {
    return {
      success: false,
      message: "File type not allowed",
    };
  }

  // Check total storage usage
  const totalUsedStorage = await calculateUsedStorage(session!.id);

  if (totalUsedStorage + fileSize > limits.maxTotalStorage) {
    const remainingStorage = limits.maxTotalStorage - totalUsedStorage;
    return {
      success: false,
      message: `Storage limit exceeded. Remaining space: ${(
        remainingStorage /
        1024 /
        1024
      ).toFixed(1)}MB`,
    };
  }

  return {
    success: true,
  };
};

export const calculateUsedStorage = async (userId: string) => {
  const userFiles = await File.find({ userId });
  const totalUsedStorage = userFiles.reduce(
    (sum, file) => sum + (file.size ?? 0),
    0
  );
  return totalUsedStorage;
};

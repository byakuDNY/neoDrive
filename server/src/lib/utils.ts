import crypto from "crypto";
import { File } from "../models/fileModel";

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

export const calculateUsedStorage = async (userId: string) => {
  const userFiles = await File.find({ userId });
  const totalUsedStorage = userFiles.reduce(
    (sum, file) => sum + (file.size ?? 0),
    0
  );
  return totalUsedStorage;
};

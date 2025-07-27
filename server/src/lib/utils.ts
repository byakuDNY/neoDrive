import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { File } from "../models/fileModel";
import { User } from "../models/userModel";
import { getSession } from "./session";

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

export const validateSession = async (
  request: FastifyRequest,
  reply: FastifyReply,
  userId: string
) => {
  const session = getSession(request);
  if (!session) {
    reply.status(401).send({ message: "Invalid session" });
    return;
  }

  if (session.id !== userId) {
    reply.status(403).send({ message: "Unauthorized" });
    return;
  }

  const user = await User.findOne({ id: session.id });
  if (!user) {
    reply.status(404).send({ message: "User not found" });
    return;
  }

  return { session, user };
};

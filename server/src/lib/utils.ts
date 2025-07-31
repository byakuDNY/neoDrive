import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { File } from "../models/fileModel";
import { User } from "../models/userModel";
import { getSession } from "./session";

export const hashPassword = (password: string, salt: string) => {
  const hash = crypto.scryptSync(password.normalize(), salt, 64);
  return hash.toString("hex");
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
  const totalUsedStorage = userFiles.reduce((sum, file) => sum + file.size, 0);
  return totalUsedStorage;
};

export const validateSession = async (
  request: FastifyRequest,
  reply: FastifyReply,
  userId: string
) => {
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({ message: "Invalid session" });
  }

  if (session.id !== userId) {
    return reply.status(403).send({ message: "Unauthorized" });
  }

  const user = await User.findOne({ id: session.id });
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  return { session, user };
};

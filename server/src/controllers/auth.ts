import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, signUpSchema } from "../lib/schemas";
import { clearSession, createSession, getSession } from "../lib/session";
import { comparePassword, generateSalt, hashPassword } from "../lib/utils";
import { User } from "../models/user";

export const handleLogin = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    subscription: string;
  };
}> => {
  const { success, data } = loginSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ success: false, message: "Invalid data" });
  }

  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return { success: false, message: "Failed to find user" };
    }

    const isPasswordCorrect = comparePassword(
      data.password,
      user.password,
      user.salt
    );
    if (!isPasswordCorrect) {
      return { success: false, message: "Invalid password" };
    }

    createSession(user, reply);

    return {
      success: true,
      message: "User login successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    };
  } catch (error) {
    throw error;
  }
};
export const handleSignup = async (
  request: FastifyRequest
): Promise<{
  success: boolean;
  message: string;
}> => {
  const { success, data } = signUpSchema.safeParse(request.body);
  if (!success) {
    return { success: false, message: "Invalid data" };
  }

  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const randomSalt = generateSalt();
    const hashedPassword = hashPassword(data.password, randomSalt);

    await User.create({
      id: `${data.name}-${crypto.randomUUID()}`,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      salt: randomSalt,
      subscription: "free",
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    throw error;
  }
};

export const handleGetSession = (
  request: FastifyRequest
): {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    subscription: string;
  };
} => {
  try {
    const session = getSession(request);
    if (!session) {
      return {
        success: false,
        message: "Invalid session",
      };
    }

    return {
      success: true,
      message: "Session retrieved successfully",
      data: {
        id: session.id,
        name: session.name,
        email: session.email,
        subscription: session.subscription,
      },
    };
  } catch (error) {
    throw error;
  }
};
// export const handleLogout = (
//   request: FastifyRequest,
//   reply: FastifyReply
// ): {
//   success: boolean;
// } => {
//   clearSession(request, reply);
//   return { success: true };
// };
export const handleLogout = (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const cleared = clearSession(request, reply);

    return reply.send({
      success: true,
      message: cleared ? "Logged out successfully" : "No active session",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return reply.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

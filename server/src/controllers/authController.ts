import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { loginSchema, signUpSchema } from "../lib/schemas";
import { clearSession, createSession, getSession } from "../lib/session";
import { comparePassword, generateSalt, hashPassword } from "../lib/utils";
import { User } from "../models/userModel";

export const handleLogin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = loginSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  try {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return reply.status(404).send({ message: "Failed to find user" });
    }

    const isPasswordCorrect = comparePassword(
      data.password,
      user.password,
      user.salt
    );
    if (!isPasswordCorrect) {
      return reply.status(401).send({ message: "Invalid password" });
    }
    console.warn("creating session");
    createSession(user, reply);

    return reply.status(200).send({
      message: "User login successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return reply.status(500).send({ message: "Failed to log in" });
  }
};
export const handleSignup = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = signUpSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ success: false, message: "Invalid data" });
  }

  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return reply.status(409).send({ message: "User already exists" });
    }

    const randomSalt = generateSalt();
    const hashedPassword = hashPassword(data.password, randomSalt);

    await User.create({
      id: `${data.name}-${ulid()}`,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      salt: randomSalt,
      subscription: "free",
    });

    return reply.status(201).send({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return reply.status(500).send({ message: "Failed to create user" });
  }
};

export const handleGetSession = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);
  if (!session) {
    return reply.status(401).send({
      message: "Invalid session",
    });
  }

  return reply.status(200).send({
    message: "Session retrieved successfully",
    data: {
      id: session.id,
      name: session.name,
      email: session.email,
      subscription: session.subscription,
    },
  });
};
export const handleLogout = (request: FastifyRequest, reply: FastifyReply) => {
  const { message } = clearSession(request, reply);
  return reply.status(200).send({ message });
};

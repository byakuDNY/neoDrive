import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { ADMIN_CREDENTIALS } from "../lib/constants";
import { adminLoginSchema, loginSchema, signUpSchema } from "../lib/schemas";
import { clearSession, createSession } from "../lib/session";
import { clearAdminSession, createAdminSession } from "../lib/sessionAdmin";
import { stripeClient } from "../lib/stripe";
import {
  comparePassword,
  generateSalt,
  hashPassword,
  validateSession,
} from "../lib/utils";
import { User } from "../models/userModel";

export const handleFetchUserData = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = request.params as { userId: string };

  try {
    const validation = await validateSession(request, reply, userId);
    if (!validation) return;

    const { user } = validation;

    return reply.status(200).send({
      message: "User retrieved successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return reply.status(500).send({ message: "Failed to retrieve user" });
  }
};
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
    // create stripe customer
    const stripeCustomer = await stripeClient.customers.create({
      email: data.email,
      name: data.name,
    });
    if (!stripeCustomer.id) {
      return reply
        .status(500)
        .send({ message: "Failed to create Stripe customer" });
    }

    await User.create({
      id: `${data.name}_${ulid()}`,
      stripeCustomerId: stripeCustomer.id,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      salt: randomSalt,
      subscription: "Free",
    });

    return reply.status(201).send({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return reply.status(500).send({ message: "Failed to create user" });
  }
};
export const handleLogout = (request: FastifyRequest, reply: FastifyReply) => {
  const { message } = clearSession(request, reply);
  return reply.status(200).send({ message });
};

export const handleAdminLogin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data } = adminLoginSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({ message: "Invalid data" });
  }

  const adminUser = ADMIN_CREDENTIALS.find(
    (admin) => admin.name === data.name && admin.password === data.password
  );
  if (!adminUser) {
    return reply.status(401).send({ message: "Invalid admin credentials" });
  }

  try {
    createAdminSession(adminUser.name, reply);

    return reply.status(200).send({
      message: "Admin login successful",
      data: {
        name: adminUser.name,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    return reply.status(500).send({ message: "Failed to log in" });
  }
};

export const handleAdminLogout = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { message } = clearAdminSession(request, reply);
  return reply.status(200).send({ message });
};

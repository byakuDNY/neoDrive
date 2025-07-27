import { FastifyReply, FastifyRequest } from "fastify";
import { nameChangeSchema, passwordChangeSchema } from "../lib/schemas";
import { sessions } from "../lib/session";
import {
  comparePassword,
  generateSalt,
  hashPassword,
  validateSession,
} from "../lib/utils";

export const handleNameChange = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data, error } = nameChangeSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({
      message: "Invalid data",
      errors: error.errors,
    });
  }

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const { session, user } = validation;
    const newName = data.name;

    if (user.name === newName) {
      return reply.status(400).send({
        message: "Name must be different from the current name",
      });
    }

    user.name = newName;
    await user.save();

    const updatedSession = { ...session, name: newName };
    sessions.set(`session:${session.id}`, updatedSession);

    return reply.status(200).send({
      message: "Name changed successfully",
      data: {
        name: newName,
      },
    });
  } catch (error) {
    console.error("Error changing name:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const handlePasswordChange = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { success, data, error } = passwordChangeSchema.safeParse(request.body);
  if (!success) {
    return reply.status(400).send({
      message: "Invalid data",
      errors: error.errors,
    });
  }

  try {
    const validation = await validateSession(request, reply, data.userId);
    if (!validation) return;

    const { user } = validation;

    const isCurrentPasswordCorrect = comparePassword(
      data.currentPassword,
      user.password,
      user.salt
    );
    if (!isCurrentPasswordCorrect) {
      return reply
        .status(401)
        .send({ message: "Current password is incorrect" });
    }

    const isSamePassword = comparePassword(
      data.newPassword,
      user.password,
      user.salt
    );
    if (isSamePassword) {
      return reply.status(400).send({
        message: "New password must be different from the current password",
      });
    }

    const newSalt = generateSalt();
    const hashedPassword = hashPassword(data.newPassword, newSalt);

    user.password = hashedPassword;
    user.salt = newSalt;
    await user.save();

    return reply.status(200).send({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

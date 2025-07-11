import { FastifyReply, FastifyRequest } from "fastify";
import { nameChangeSchema, passwordChangeSchema } from "../lib/user";
import { getSession, sessions } from "../lib/session";
import { User } from "../models/user";
import { comparePassword, generateSalt, hashPassword } from "../lib/utils";

export const handleNameChange = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const { success, data } = nameChangeSchema.safeParse(request.body);
    if (!success) {
        return reply.status(400).send({ message: "Invalid name changing data" });
    }
    try {
        const session = getSession(request);
        if (!session) {
            return reply.status(401).send({ message: "Invalid session", });
        }
        const user = await User.findOne({ id: session.id });
        if (!user) {
            return reply.status(404).send({ message: "User not found" });
        }
        if (user.name === data.name) {
            return reply.status(400).send({ message: "New name must be different to the previous name" });
        }
        user.name = data.name;
        await user.save();
        session.name = data.name;
        sessions.set(`session:${session.id}`, session);
        return reply.status(200).send({
            message: "Name changed successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error changing name:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
}

export const handlePasswordChange = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const { success, data } = passwordChangeSchema.safeParse(request.body);
    if (!success) {
        return reply.status(400).send({ message: "Invalid password changing data" });
    }
    try {
        const session = getSession(request);
        if (!session) {
            return reply.status(401).send({ message: "Invalid session", });
        }
        const user = await User.findOne({ id: session.id });
        if (!user) { return reply.status(404).send({ message: "User not found" }); }
        const isPasswordCorrect = comparePassword(
            data.currentPassword,
            user.password,
            user.salt
        );
        if (!isPasswordCorrect) {
            return reply.status(401).send({ message: "Invalid current password" });
        }
        const isPasswordSameAsPrevious = comparePassword(
            data.newPassword,
            user.password,
            user.salt
        );
        if (isPasswordSameAsPrevious) {
            return reply.status(400).send({ message: "New password cannot be the same as the current password" });
        }
        const newSalt = generateSalt();
        const hashedPassword = hashPassword(data.newPassword, newSalt);
        user.password = hashedPassword;
        user.salt = newSalt;
        await user.save();
        return reply.status(200).send({
            message: "Password changed successfully",
        })
    } catch (error) {
        console.error("Error changing password:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
}
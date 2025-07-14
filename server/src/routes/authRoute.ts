import { FastifyInstance } from "fastify";
import {
  handleGetSession,
  handleLogin,
  handleLogout,
  handleSignup,
} from "../controllers/authController";
import { sessions } from "../lib/session";
import { User } from "../models/userModel";

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/login", handleLogin);
  fastify.post("/signup", handleSignup);
  fastify.post("/logout", handleLogout);
  fastify.get("/me", handleGetSession);

  fastify.get("/debug/users", async () => {
    return await User.find();
  });

  fastify.delete("/debug/users", async () => {
    return await User.deleteMany({});
  });

  fastify.get("/debug/sessions", async () => {
    const sessionList = [];

    for (const [sessionId, session] of sessions) {
      sessionList.push({
        // sessionId: sessionId.substring(0, 8) + "...", // Hide full ID
        sessionId: sessionId,
        userId: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isExpired: Date.now() > session.expiresAt,
      });
    }

    return {
      totalSessions: sessions.size,
      sessions: sessionList,
    };
  });
};

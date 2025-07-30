import { FastifyInstance } from "fastify";
import {
  handleAdminLogin,
  handleAdminLogout,
  handleFetchUserData,
  handleLogin,
  handleLogout,
  handleSignup,
} from "../controllers/authController";
import { adminSessions, sessions } from "../lib/session";
import { User } from "../models/userModel";

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/me/:userId", handleFetchUserData);
  fastify.post("/login", handleLogin);
  fastify.post("/signup", handleSignup);
  fastify.post("/logout", handleLogout);

  fastify.post("/admin/login", handleAdminLogin);
  fastify.post("/admin/logout", handleAdminLogout);

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
        name: session.name,
        email: session.email,
        subscription: session.subscription,
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

  fastify.get("/debug/admin-sessions", async () => {
    const sessionList = [];

    for (const [sessionId, session] of adminSessions) {
      sessionList.push({
        // sessionId: sessionId.substring(0, 8) + "...", // Hide full ID
        sessionId: sessionId,
        userId: session.id,
        name: session.name,
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

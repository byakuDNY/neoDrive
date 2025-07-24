import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import {
  ADMIN_COOKIE_SESSION_KEY,
  ADMIN_CREDENTIALS,
  SESSION_EXPIRATION,
} from "./constants";

export const adminSessions = new Map<
  string,
  {
    id: string;
    name: string;
    createdAt: number;
    expiresAt: number;
  }
>();

export type AdminSession = ReturnType<typeof adminSessions.get>;

export const validateAdminCredentials = (name: string, password: string) => {
  return ADMIN_CREDENTIALS.find(
    (admin) => admin.name === name && admin.password === password
  );
};

export const getAdminSession = (request: FastifyRequest) => {
  const sessionId = request.cookies[ADMIN_COOKIE_SESSION_KEY];

  if (!sessionId) {
    return null;
  }

  return adminSessions.get(`admin_session:${sessionId}`);
};

export const createAdminSession = (adminName: string, reply: FastifyReply) => {
  const sessionId = ulid();

  adminSessions.set(`admin_session:${sessionId}`, {
    id: sessionId,
    name: adminName,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
  });

  setAdminCookie(reply, sessionId);
};

export const clearAdminSession = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const sessionId = request.cookies[ADMIN_COOKIE_SESSION_KEY];

  if (!sessionId) {
    return { message: "No active admin session to clear" };
  }

  reply.clearCookie(ADMIN_COOKIE_SESSION_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  adminSessions.delete(`admin_session:${sessionId}`);

  return { message: "Admin session cleared successfully" };
};

const setAdminCookie = (reply: FastifyReply, sessionId: string) => {
  reply.setCookie(ADMIN_COOKIE_SESSION_KEY, sessionId, {
    maxAge: SESSION_EXPIRATION * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

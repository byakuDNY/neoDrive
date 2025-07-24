import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { IUser } from "../models/userModel";
import { COOKIE_SESSION_KEY, SESSION_EXPIRATION } from "./constants";

export const sessions = new Map<
  string,
  {
    id: string;
    name: string;
    email: string;
    subscription: string;
    createdAt: number;
    expiresAt: number;
  }
>();

export type Session = ReturnType<typeof sessions.get>;

export const getSession = (request: FastifyRequest) => {
  const sessionId = request.cookies[COOKIE_SESSION_KEY];

  if (!sessionId) {
    return null;
  }

  return sessions.get(`session:${sessionId}`);
};

export const createSession = (user: IUser, reply: FastifyReply) => {
  const sessionId = ulid();

  sessions.set(`session:${sessionId}`, {
    id: user.id,
    name: user.name,
    email: user.email,
    subscription: user.subscription,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
  });

  setCookie(reply, sessionId);
};

export const clearSession = (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = request.cookies[COOKIE_SESSION_KEY];

  if (!sessionId) {
    return { message: "No active session to clear" };
  }

  reply.clearCookie(COOKIE_SESSION_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  sessions.delete(`session:${sessionId}`);

  return { message: "Session cleared successfully" };
};

const setCookie = (reply: FastifyReply, sessionId: string) => {
  reply.setCookie(COOKIE_SESSION_KEY, sessionId, {
    maxAge: SESSION_EXPIRATION * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

export const cleanupExpiredSessions = () => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of sessions) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  }

  console.log(`Cleaned up ${cleanedCount} expired sessions`);
};

export const updateSessionExpiration = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);

  if (!session) return null;

  sessions.set(`session:${session}`, {
    ...session,
    expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
  });

  setCookie(reply, session.id);

  return true;
};

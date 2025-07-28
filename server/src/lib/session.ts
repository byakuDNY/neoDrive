import { FastifyReply, FastifyRequest } from "fastify";
import { ulid } from "ulidx";
import { IUser, SubscriptionPlan } from "../models/userModel";
import {
  ADMIN_COOKIE_SESSION_KEY,
  COOKIE_SESSION_KEY,
  SESSION_EXPIRATION,
} from "./constants";

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
export const adminSessions = new Map<
  string,
  {
    id: string;
    name: string;
    createdAt: number;
    expiresAt: number;
  }
>();

export type Session = ReturnType<typeof sessions.get>;
export type AdminSession = ReturnType<typeof adminSessions.get>;

export const getSession = (request: FastifyRequest, isAdmin: boolean) => {
  const sessionId =
    request.cookies[isAdmin ? ADMIN_COOKIE_SESSION_KEY : COOKIE_SESSION_KEY];
  if (!sessionId) return;

  // if (isAdmin) {
  //   return adminSessions.get(`admin_session:${sessionId}`);
  // }
  return sessions.get(`${isAdmin ? `admin_` : ""}session:${sessionId}`);
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

export const updateSession = (
  userId: string,
  updates: {
    subscription?: SubscriptionPlan;
  }
) => {
  for (const [sessionId, session] of sessions) {
    if (session.id === userId) {
      const updatedSession = {
        ...session,
        ...updates,
        expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
      };
      sessions.set(sessionId, updatedSession);
    }
  }
  // console.log(`Updated sessions for user ${userId}`);
  // console.log('All current sessions:', Array.from(sessions.entries()));
};

export const createAdminSession = (adminName: string, reply: FastifyReply) => {
  const sessionId = ulid();

  adminSessions.set(`admin_session:${sessionId}`, {
    id: sessionId,
    name: adminName,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
  });

  setCookie(reply, sessionId, true);
};

export const clearSession = (
  request: FastifyRequest,
  reply: FastifyReply,
  isAdmin: boolean
) => {
  const sessionId =
    request.cookies[isAdmin ? ADMIN_COOKIE_SESSION_KEY : COOKIE_SESSION_KEY];

  if (!sessionId) {
    return { message: "No active session to clear" };
  }

  reply.clearCookie(isAdmin ? ADMIN_COOKIE_SESSION_KEY : COOKIE_SESSION_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  if (isAdmin) {
    adminSessions.delete(`admin_session:${sessionId}`);
  } else {
    sessions.delete(`session:${sessionId}`);
  }
  return { message: "Session cleared successfully" };
};

const setCookie = (
  reply: FastifyReply,
  sessionId: string,
  isAdmin?: boolean
) => {
  reply.setCookie(
    isAdmin ? ADMIN_COOKIE_SESSION_KEY : COOKIE_SESSION_KEY,
    sessionId,
    {
      maxAge: SESSION_EXPIRATION * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    }
  );
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

  for (const [sessionId, session] of adminSessions) {
    if (now > session.expiresAt) {
      adminSessions.delete(sessionId);
      cleanedCount++;
    }
  }

  console.log(`Cleaned up ${cleanedCount} expired sessions`);
};

export const updateSessionExpiration = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const sessionId = request.cookies[COOKIE_SESSION_KEY];
  if (!sessionId) return;

  const session = sessions.get(`session:${sessionId}`);
  if (!session) return;

  sessions.set(`session:${sessionId}`, {
    ...session,
    expiresAt: Date.now() + SESSION_EXPIRATION * 1000,
  });

  setCookie(reply, session.id);
  console.log(`[Session] Updated expiration for user ${session.id}`);
};

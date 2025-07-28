import { FastifyReply, FastifyRequest } from "fastify";
import { getSession, updateSessionExpiration } from "../lib/session.js";

export const sessionUpdateMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request, false);

  if (session) {
    updateSessionExpiration(request, reply);
  }
};

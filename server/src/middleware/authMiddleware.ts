import { FastifyReply, FastifyRequest } from "fastify";
import { getSession, updateSessionExpiration } from "../lib/session.js";

export const sessionUpdateMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const session = getSession(request);

  if (session) {
    updateSessionExpiration(request, reply);
    console.log(`[Session] Updated expiration for user ${session.id}`);
  }
};

// Type declaration for request.user (optional)
// declare module 'fastify' {
//   interface FastifyRequest {
//     user?: {
//       id: string;
//       name: string;
//       email: string;
//       subscription: string;
//     };
//   }
// }

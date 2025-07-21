import { FastifyInstance } from "fastify";
import { handleWebhooks } from "../controllers/webhookController";

export const webhookRoutes = async (fastify: FastifyInstance) => {
    fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        done(null, body);
    });
    fastify.post("/", handleWebhooks);
}
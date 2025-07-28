import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { CLEANUP_INTERVAL } from "./src/lib/constants";
import { envConfig } from "./src/lib/envConfig";
import { connectToMongoDB } from "./src/lib/mongoConnection";
import { validateS3BucketAccess } from "./src/lib/s3Client";
import { cleanupExpiredSessions } from "./src/lib/session.js";
import { authRoutes } from "./src/routes/authRoute";
import { fileRoutes } from "./src/routes/fileRoute";
import { paymentHistoryRoutes } from "./src/routes/paymentHistoriesRoute";
import { stripeRoutes } from "./src/routes/stripeRoutes";
import { userRoutes } from "./src/routes/userRoutes";
import { webhookRoutes } from "./src/routes/webhookRoutes";

const fastify = Fastify();

const startServer = async () => {
  try {
    await connectToMongoDB();

    fastify.register(cors, {
      origin: ["http://localhost:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    });

    fastify.register(cookie);

    fastify.get("/", () => {
      return { message: "Hello neoDrive!" };
    });

    fastify.register(authRoutes, {
      prefix: "/api/auth",
    });
    fastify.register(userRoutes, {
      prefix: "/api/user",
    });
    fastify.register(stripeRoutes, {
      prefix: "/api/stripe",
    });
    fastify.register(fileRoutes, {
      prefix: "/api/file",
    });

    fastify.register(webhookRoutes, {
      prefix: "/api/webhook",
    });

    fastify.register(paymentHistoryRoutes, {
      prefix: "/api/paymentHistories",
    });

    const s3Connected = await validateS3BucketAccess();
    if (!s3Connected) {
      process.exit(1);
    }

    await fastify.listen({
      port: envConfig.SERVER_PORT,
    });

    setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

    console.log(`🚀 Servidor Fastify corriendo en ${envConfig.SERVER_URL}`);
    console.log("📊 Endpoints disponibles:");
    console.log("   - GET  /");
    console.log("   - CRUD /api/user");
    console.log("   - CRUD /api/file");
    console.log("   - AUTH /api/auth");
    console.log("   - STRIPE /api/stripe");
    console.log("   - GET /api/paymentHistories");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

startServer();

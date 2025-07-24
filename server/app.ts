import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
// import Database from "./src/config/database";
import { CLEANUP_INTERVAL } from "./src/lib/constants";
import { connectToMongoDB } from "./src/lib/mongoConnection";
import { validateS3BucketAccess } from "./src/lib/s3Client";
import { cleanupExpiredSessions } from "./src/lib/session.js";
import { authRoutes } from "./src/routes/authRoute";
import { fileRoutes } from "./src/routes/fileRoute";
import { stripeRoutes } from "./src/routes/stripeRoutes";
import { userRoutes } from "./src/routes/userRoutes";
import { webhookRoutes } from "./src/routes/webhookRoutes";
import { paymentHistoryRoutes } from "./src/routes/paymentHistoriesRoute";

const fastify = Fastify();

const startServer = async () => {
  try {
    // await Database.connect();
    await connectToMongoDB();

    fastify.register(cors, {
      origin: ["http://localhost:5173", "https://neodrive-kappa.vercel.app"],
      credentials: true, // Important for cookies
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Explicitly list methods
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

    fastify.register(paymentHistoryRoutes,{
      prefix: "/api/paymentHistories",
    })

    const s3Connected = await validateS3BucketAccess();
    if (!s3Connected) {
      process.exit(1);
    }

    await fastify.listen({
      port: 3000,
    });

    setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

    console.log("🚀 Servidor Fastify corriendo en http://localhost:3000");
    console.log("📊 Endpoints disponibles:");
    console.log("   - GET  /");
    console.log("   - CRUD /api/user");
    console.log("   - CRUD /api/file");
    console.log("   - AUTH /api/auth");
    console.log("   - STRIPE /api/stripe");
    console.log("   - GET /api/paymentHistories");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();

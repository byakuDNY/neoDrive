import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import Fastify from "fastify";
import Database from "./src/config/database";
import { validateS3BucketAccess } from "./src/lib/s3Client";
import { CLEANUP_INTERVAL, cleanupExpiredSessions } from "./src/lib/session.js";
import { authRoutes } from "./src/routes/authRoute";
import { fileRoutes } from "./src/routes/fileRoute";
import { stripeRoutes } from "./src/routes/stripe";
import { userRoutes } from "./src/routes/user";


const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

const startServer = async () => {
  try {
    await Database.connect();

    // const minioConnected = await checkBucketConnection();
    // if (!minioConnected) {
    //   await Database.disconnect();
    //   process.exit(1);
    // }

    fastify.register(cors, {
      origin: ["http://localhost:5173", "https://neodrive-kappa.vercel.app"],
      credentials: true, // Important for cookies
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

    // const minioConnected = await checkBucketConnection();
    // if (!minioConnected) {
    //   await Database.disconnect();
    //   process.exit(1);
    // }

    const s3Connected = await validateS3BucketAccess();
    if (!s3Connected) {
      await Database.disconnect();
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
  } catch (err) {
    fastify.log.error(err);
    await Database.disconnect();
    process.exit(1);
  }
};

startServer();

import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { PORT, MONGODB_URI, COOKIE_SESSION } from "./config/config";
import connectDB from "./config/connectDB";
import { sendResponse, sendError } from "./utils/responseHandler";
import { authRoutes } from "./routes/auth.routes";
import { categoryRoutes } from "./routes/category.routes";
import { productRoutes } from "./routes/product.routes";
import { trackingRoutes } from "./routes/tracking.routes";

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  },
});

// Register Cookie plugin for httpOnly authentication cookies
app.register(fastifyCookie, {
  secret: COOKIE_SESSION,
});

// Health check route
app.get("/", async (_request, reply) => {
  return sendResponse(reply, 200, "Grocery App API is running");
});

// Register application routes
app.register(authRoutes, { prefix: "/api/auth" });
app.register(categoryRoutes, { prefix: "/api/categories" });
app.register(productRoutes, { prefix: "/api/products" });
app.register(trackingRoutes, { prefix: "/api" });
app.register(trackingRoutes, { prefix: "/api/tracking" });

// Universal 404 handler for unmatched routes
app.setNotFoundHandler((request, reply) => {
  return sendError(
    reply,
    404,
    `Route ${request.method} ${request.url} not found`
  );
});

// Global error handler for uncaught errors
app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  app.log.error(
    `[app.errorHandler] -> ${request.method} ${request.url} [${statusCode}]: ${message}`
  );

  return sendError(reply, statusCode, message);
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB(MONGODB_URI, app.log);

    await app.listen({ port: PORT, host: "0.0.0.0" });

    app.log.info(`[app.startServer] -> Server running on port ${PORT}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    app.log.error(
      `[app.startServer] -> Failed to start server: ${message}`
    );
    process.exit(1);
  }
};

startServer();

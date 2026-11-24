import Fastify from "fastify";
import { PORT, MONGODB_URI } from "./config/config";
import connectDB from "./config/connectDB";

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

// Health check route
app.get("/", async (_request, _reply) => {
  return { status: "ok", message: "Grocery App API is running" };
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

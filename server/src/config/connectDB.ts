import mongoose from "mongoose";
import type { FastifyBaseLogger } from "fastify";

const connectDB = async (
  uri: string,
  logger: FastifyBaseLogger
): Promise<void> => {
  try {
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);

    const dbName = mongoose.connection.db?.databaseName ?? "unknown";

    logger.info(`[connectDB] -> MongoDB connected successfully to "${dbName}"`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`[connectDB] -> MongoDB connection failed: ${message}`);

    process.exit(1);
  }
};

export default connectDB;

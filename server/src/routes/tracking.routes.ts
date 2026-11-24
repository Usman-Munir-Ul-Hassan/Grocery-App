import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { updateUser } from "../controllers/tracking.controller";
import { verifyAuth } from "../middleware/auth.middleware";

// Fastify plugin for user tracking & profile updates
export async function trackingRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Update user profile or delivery partner's liveLocation (GPS)
  fastify.patch("/user", { preHandler: [verifyAuth] }, updateUser);
}

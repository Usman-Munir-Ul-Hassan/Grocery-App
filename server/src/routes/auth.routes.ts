import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  loginCustomer,
  loginDeliveryPartner,
  loginAdmin,
  refreshTokenHandler,
  getUserDetails,
} from "../controllers/auth.controller";
import { verifyAuth } from "../middleware/auth.middleware";

// Fastify plugin defining all authentication endpoints
export async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get current logged-in user profile (Protected)
  fastify.get("/user", { preHandler: [verifyAuth] }, getUserDetails);

  // Customer login (Phone based)
  fastify.post("/customer/login", loginCustomer);

  // Delivery Partner login (Email & Password)
  fastify.post("/delivery/login", loginDeliveryPartner);

  // Admin login (Email & Password)
  fastify.post("/admin/login", loginAdmin);

  // Refresh Token endpoint
  fastify.post("/refresh-token", refreshTokenHandler);
}

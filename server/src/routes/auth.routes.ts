import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  loginCustomer,
  loginDeliveryPartner,
  loginAdmin,
  refreshTokenHandler,
} from "../controllers/auth.controller";

// Fastify plugin defining all authentication endpoints
export async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Customer login (Phone based)
  fastify.post("/customer/login", loginCustomer);

  // Delivery Partner login (Email & Password)
  fastify.post("/delivery/login", loginDeliveryPartner);

  // Admin login (Email & Password)
  fastify.post("/admin/login", loginAdmin);

  // Refresh Token endpoint
  fastify.post("/refresh-token", refreshTokenHandler);
}

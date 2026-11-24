import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getProductsByCategoryId } from "../controllers/product.controller";

// Fastify plugin for Product routes
export async function productRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get products by category ID
  fastify.get("/:categoryId", getProductsByCategoryId);
}

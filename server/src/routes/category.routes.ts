import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getAllCategories } from "../controllers/category.controller";

// Fastify plugin for Category routes
export async function categoryRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Get all categories
  fastify.get("/", getAllCategories);
}

import type { FastifyRequest, FastifyReply } from "fastify";
import { Product } from "../models";
import { sendResponse, sendError } from "../utils/responseHandler";

// Fetch products for a specific category and deselect the category field
export async function getProductsByCategoryId(
  request: FastifyRequest<{ Params: { categoryId: string } }>,
  reply: FastifyReply
) {
  try {
    const { categoryId } = request.params;

    if (!categoryId) {
      return sendError(reply, 400, "Category ID is required");
    }

    // Find products matching the category, and deselect (-category) to avoid sending duplicate category IDs
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();

    return sendResponse(reply, 200, "Products fetched successfully", products);
  } catch (error) {
    return sendError(reply, 500, "Failed to fetch products", error);
  }
}

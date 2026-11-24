import type { FastifyRequest, FastifyReply } from "fastify";
import { Category } from "../models";
import { sendResponse, sendError } from "../utils/responseHandler";

// Fetch all categories from the database
export async function getAllCategories(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const categories = await Category.find();

    return sendResponse(
      reply,
      200,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    return sendError(reply, 500, "Failed to fetch categories", error);
  }
}

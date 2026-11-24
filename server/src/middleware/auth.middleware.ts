import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/token";
import { sendError } from "../utils/responseHandler";

// Tell TypeScript that FastifyRequest has our custom user object
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      role: string;
    };
  }
}

// Middleware: Verifies accessToken from cookies or Authorization header
export async function verifyAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Read token from cookie first, fallback to Authorization header
    let token = request.cookies.accessToken;

    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 2. If no token was found, reject and log warning
    if (!token) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> Missing token on protected route: ${request.url}`
      );
      return sendError(reply, 401, "Authentication required. Please login.");
    }

    // 3. Verify the token signature and expiration
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> Invalid or expired token on route: ${request.url}`
      );
      return sendError(reply, 401, "Invalid or expired access token. Please login again.");
    }

    // 4. Attach decoded user identity to request object for controllers to use
    request.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(
      `[auth.middleware.verifyAuth] -> Unexpected error: ${errorMessage}`
    );
    return sendError(reply, 500, "Authentication verification failed");
  }
}

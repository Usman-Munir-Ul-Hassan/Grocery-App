import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/token";
import { sendError } from "../utils/responseHandler";
import { findUserByIdAndRole, checkUserIsActive } from "../services/auth.service";

// Tell TypeScript that FastifyRequest has our custom user object
declare module "fastify" {
  interface FastifyRequest {
    user?: {
      userId: string;
      role: string;
    };
  }
}

// Middleware 1: Verifies token, checks user exists in DB, and blocks banned users
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

    // 2. Reject if no token found
    if (!token) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> Missing token on protected route: ${request.url}`
      );
      return sendError(reply, 401, "Authentication required. Please login.");
    }

    // 3. Verify token signature and expiration
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> Invalid or expired token on route: ${request.url}`
      );
      return sendError(reply, 401, "Invalid or expired access token. Please login again.");
    }

    // 4. Check MongoDB: Ensure user still exists
    const user = await findUserByIdAndRole(decoded.userId, decoded.role);

    if (!user) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> User no longer exists in DB: ${decoded.userId}`
      );
      return sendError(reply, 404, "User account no longer exists");
    }

    // 5. Check MongoDB: Ensure user is NOT banned
    if (!checkUserIsActive(user)) {
      request.log.warn(
        `[auth.middleware.verifyAuth] -> Blocked banned/deactivated user: ${decoded.userId}`
      );
      return sendError(reply, 403, "Your account has been deactivated. Please contact support.");
    }

    // 6. Attach user info to request object
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

// Middleware 2: Role Authorization Guard (Checks if user has required role)
export function authorizeRoles(allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.user?.role;

    // Check if user's role is in the allowed list
    if (!userRole || !allowedRoles.includes(userRole)) {
      request.log.warn(
        `[auth.middleware.authorizeRoles] -> Denied access to user [${request.user?.userId}] with role [${userRole}]. Required: ${allowedRoles.join(", ")}`
      );
      return sendError(
        reply,
        403,
        `Access denied. This action requires one of the following roles: ${allowedRoles.join(", ")}`
      );
    }
  };
}

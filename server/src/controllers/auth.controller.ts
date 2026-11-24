import type { FastifyRequest, FastifyReply } from "fastify";
import { sendResponse, sendError } from "../utils/responseHandler";
import { generateTokens, verifyRefreshToken, verifyAccessToken } from "../utils/token";
import {
  findCustomerByPhone,
  createNewCustomer,
  findDeliveryPartnerByEmail,
  findAdminByEmail,
  checkUserIsActive,
  verifyPassword,
  findUserByIdAndRole,
} from "../services/auth.service";

// Set httpOnly cookies for access and refresh tokens
function setAuthCookies(
  reply: FastifyReply,
  tokens: { accessToken: string; refreshToken: string }
) {
  // Access token cookie (expires in 1 day)
  reply.setCookie("accessToken", tokens.accessToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
  });

  // Refresh token cookie (expires in 7 days)
  reply.setCookie("refreshToken", tokens.refreshToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });
}

// Customer Login: Logs in with phone number (creates account if first time)
export async function loginCustomer(
  request: FastifyRequest<{ Body: { phone: string; email?: string; username?: string } }>,
  reply: FastifyReply
) {
  try {
    const { phone, email, username } = request.body || {};

    if (!phone) {
      return sendError(reply, 400, "Phone number is required");
    }

    let customer = await findCustomerByPhone(phone);

    // If customer doesn't exist yet, create them automatically
    if (!customer) {
      customer = await createNewCustomer(phone, email, username);
    }

    // Check if account is banned or deactivated
    if (!checkUserIsActive(customer)) {
      return sendError(reply, 403, "Your account is deactivated. Please contact support.");
    }

    const tokens = generateTokens(customer);

    // Set secure httpOnly cookies
    setAuthCookies(reply, tokens);

    return sendResponse(reply, 200, "Login successful", {
      user: customer,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to login customer", error);
  }
}

// Delivery Partner Login: Logs in with email and password
export async function loginDeliveryPartner(
  request: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return sendError(reply, 400, "Email and password are required");
    }

    const deliveryPartner = await findDeliveryPartnerByEmail(email);

    if (!deliveryPartner) {
      return sendError(reply, 404, "Delivery partner not found");
    }

    if (!verifyPassword(password, deliveryPartner.password)) {
      return sendError(reply, 400, "Invalid email or password");
    }

    if (!checkUserIsActive(deliveryPartner)) {
      return sendError(reply, 403, "Your account is deactivated. Please contact support.");
    }

    const tokens = generateTokens(deliveryPartner);

    // Set secure httpOnly cookies
    setAuthCookies(reply, tokens);

    return sendResponse(reply, 200, "Login successful", {
      user: deliveryPartner,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to login delivery partner", error);
  }
}

// Admin Login: Logs in with email and password
export async function loginAdmin(
  request: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return sendError(reply, 400, "Email and password are required");
    }

    const admin = await findAdminByEmail(email);

    if (!admin) {
      return sendError(reply, 404, "Admin account not found");
    }

    if (!verifyPassword(password, admin.password)) {
      return sendError(reply, 400, "Invalid email or password");
    }

    if (!checkUserIsActive(admin)) {
      return sendError(reply, 403, "Your account is deactivated. Please contact support.");
    }

    const tokens = generateTokens(admin);

    // Set secure httpOnly cookies
    setAuthCookies(reply, tokens);

    return sendResponse(reply, 200, "Login successful", {
      user: admin,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to login admin", error);
  }
}

// Refresh Token: Reads cookie (or body) and returns a new access token
export async function refreshTokenHandler(
  request: FastifyRequest<{ Body?: { refreshToken?: string } }>,
  reply: FastifyReply
) {
  try {
    // Read from cookies first, fallback to request body
    const refreshToken =
      request.cookies.refreshToken || request.body?.refreshToken;

    if (!refreshToken) {
      return sendError(reply, 400, "Refresh token is required");
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return sendError(reply, 401, "Invalid or expired refresh token. Please login again.");
    }

    // Check MongoDB: Confirm user still exists in their specific collection
    const user = await findUserByIdAndRole(decoded.userId, decoded.role);

    if (!user) {
      return sendError(reply, 404, "User account no longer exists");
    }

    // Check MongoDB: Confirm user is not banned
    if (!checkUserIsActive(user)) {
      return sendError(reply, 403, "Your account is deactivated. Please contact support.");
    }

    // Generate fresh tokens using the verified user
    const newTokens = generateTokens(user);

    // Update the accessToken cookie
    reply.setCookie("accessToken", newTokens.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return sendResponse(reply, 200, "Token refreshed successfully", {
      accessToken: newTokens.accessToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to refresh token", error);
  }
}

// Get User Details: Fetches the profile of the verified user (via verifyAuth middleware)
export async function getUserDetails(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { userId, role } = request.user!;

    // Look up user in MongoDB
    const user = await findUserByIdAndRole(userId, role);

    if (!user) {
      return sendError(reply, 404, "User profile not found");
    }

    // Remove password before sending to frontend
    const userProfile = user.toObject();
    delete (userProfile as { password?: string }).password;

    return sendResponse(reply, 200, "User details fetched successfully", userProfile);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.getUserDetails] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to fetch user details", error);
  }
}

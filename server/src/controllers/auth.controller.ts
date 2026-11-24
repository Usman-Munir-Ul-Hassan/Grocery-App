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

    return sendResponse(reply, 200, "Login successful", {
      user: admin,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to login admin", error);
  }
}

// Refresh Token: Exchanges an active refresh token for a brand new access token
export async function refreshTokenHandler(
  request: FastifyRequest<{ Body: { refreshToken: string } }>,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = request.body || {};

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

    return sendResponse(reply, 200, "Token refreshed successfully", {
      accessToken: newTokens.accessToken,
    });
  } catch (error) {
    return sendError(reply, 500, "Failed to refresh token", error);
  }
}

// Get User Details: Fetches the profile of the currently logged-in user
export async function getUserDetails(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    // Check if the Authorization header was provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(reply, 401, "Access token is required. Please login.");
    }

    // Extract the token string after "Bearer "
    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return sendError(reply, 401, "Invalid or expired access token. Please login again.");
    }

    // Look up the user in MongoDB using their decoded ID and role
    const user = await findUserByIdAndRole(decoded.userId, decoded.role);

    if (!user) {
      return sendError(reply, 404, "User profile not found");
    }

    // Ensure the user is not deactivated
    if (!checkUserIsActive(user)) {
      return sendError(reply, 403, "Your account is deactivated. Please contact support.");
    }

    // Convert to plain object and remove password before sending to frontend
    const userProfile = user.toObject();
    delete (userProfile as { password?: string }).password;

    return sendResponse(reply, 200, "User details fetched successfully", userProfile);
  } catch (error) {
    return sendError(reply, 500, "Failed to fetch user details", error);
  }
}

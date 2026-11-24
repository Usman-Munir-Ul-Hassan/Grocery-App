import type { FastifyRequest, FastifyReply } from "fastify";
import { sendResponse, sendError } from "../utils/responseHandler";
import { generateTokens, verifyRefreshToken } from "../utils/token";
import {
  findCustomerByPhone,
  findCustomerByEmail,
  registerNewCustomer,
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

// Customer Register: Registers a new customer with real phone, email, and username
export async function registerCustomer(
  request: FastifyRequest<{ Body: { phone: string; email: string; username: string } }>,
  reply: FastifyReply
) {
  try {
    const { phone, email, username } = request.body || {};

    if (!phone || !email || !username) {
      return sendError(reply, 400, "Phone number, email, and username are all required");
    }

    // 1. Ensure phone number is new and unique
    const existingPhone = await findCustomerByPhone(phone);
    if (existingPhone) {
      return sendError(reply, 400, "This phone number is already registered. Please login.");
    }

    // 2. Ensure email address is new and unique
    const existingEmail = await findCustomerByEmail(email);
    if (existingEmail) {
      return sendError(reply, 400, "This email is already registered. Please use another email.");
    }

    // 3. Save the real customer in MongoDB
    const customer = await registerNewCustomer(phone, email, username);

    const tokens = generateTokens(customer);

    // Set secure httpOnly cookies
    setAuthCookies(reply, tokens);

    return sendResponse(reply, 201, "Customer registered successfully", {
      user: customer,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.registerCustomer] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to register customer", error);
  }
}

// Customer Login: Only logs in existing customers using their phone number
export async function loginCustomer(
  request: FastifyRequest<{ Body: { phone: string } }>,
  reply: FastifyReply
) {
  try {
    const { phone } = request.body || {};

    if (!phone) {
      return sendError(reply, 400, "Phone number is required");
    }

    const customer = await findCustomerByPhone(phone);

    // Do NOT auto-create customer. If not found, tell them to register!
    if (!customer) {
      return sendError(
        reply,
        404,
        "Customer not found with this phone number. Please register first."
      );
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.loginCustomer] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to login customer", error);
  }
}

// Delivery Partner Login: Logs in with email and password (checked with bcrypt)
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

    const isPasswordCorrect = await verifyPassword(password, deliveryPartner.password);

    if (!isPasswordCorrect) {
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.loginDeliveryPartner] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to login delivery partner", error);
  }
}

// Admin Login: Logs in with email and password (checked with bcrypt)
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

    const isPasswordCorrect = await verifyPassword(password, admin.password);

    if (!isPasswordCorrect) {
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.loginAdmin] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to login admin", error);
  }
}

// Refresh Token: Reads cookie (or body) and returns a new access token
export async function refreshTokenHandler(
  request: FastifyRequest<{ Body?: { refreshToken?: string } }>,
  reply: FastifyReply
) {
  try {
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[auth.controller.refreshTokenHandler] -> ${errorMessage}`);
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

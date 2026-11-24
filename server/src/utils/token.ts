import jwt from "jsonwebtoken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/config";

// The payload stored inside the token
export interface TokenPayload {
  userId: string;
  role: string;
}

// Generate both access and refresh tokens for a user
export function generateTokens(user: { _id: any; role: string }) {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  // Access token expires in 1 day
  const accessToken = jwt.sign(payload, ACCESS_TOKEN, {
    expiresIn: "1d",
  });

  // Refresh token expires in 7 days
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
}

// Verify a refresh token when the user asks for a new access token
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify an access token for protected routes
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

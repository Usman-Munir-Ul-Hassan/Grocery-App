import "dotenv/config";

export const MONGODB_URI = process.env.MONGODB_URI || "";

export const PORT = Number(process.env.PORT) || 3000;

export const COOKIE_SESSION =
  process.env.COOKIE_SESSION || "grocery_app_cookie_session_secret_123";

export const REFRESH_TOKEN =
  process.env.REFRESH_TOKEN || "grocery_app_refresh_token_secret_key_123";

export const ACCESS_TOKEN =
  process.env.ACCESS_TOKEN || "grocery_app_access_token_secret_key_123";

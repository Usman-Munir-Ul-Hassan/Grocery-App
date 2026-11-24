import "dotenv/config";

export const MONGODB_URI = process.env.MONGODB_URI || "";

export const PORT = Number(process.env.PORT) || 3000;

export const COOKIE_SESSION = process.env.COOKIE_SESSION || "";

export const REFRESH_TOKEN = process.env.REFRESH_TOKEN || "";

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "";

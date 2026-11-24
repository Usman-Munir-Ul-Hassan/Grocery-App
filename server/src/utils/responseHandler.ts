import type { FastifyReply } from "fastify";

// The shape of every response we send back from the API
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Send a success response
export function sendResponse(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  data?: any
) {
  const body: ApiResponse = {
    success: true,
    message: message,
  };

  // Only attach data if it was provided
  if (data !== undefined) {
    body.data = data;
  }

  return reply.status(statusCode).send(body);
}

// Send an error response
export function sendError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  error?: unknown
) {
  const body: ApiResponse = {
    success: false,
    message: message,
  };

  // Convert the error into plain text if present
  if (error instanceof Error) {
    body.error = error.message;
  } else if (typeof error === "string") {
    body.error = error;
  }

  return reply.status(statusCode).send(body);
}

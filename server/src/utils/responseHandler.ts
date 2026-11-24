import type { FastifyReply } from "fastify";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Send a standardized success response
 *
 * @param reply FastifyReply instance
 * @param statusCode HTTP status code (e.g., 200, 201)
 * @param message Human-readable message
 * @param data Optional payload data
 */
export const sendResponse = <T>(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  data?: T
): FastifyReply => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  };

  return reply.status(statusCode).send(responseBody);
};

/**
 * Send a standardized error response
 *
 * @param reply FastifyReply instance
 * @param statusCode HTTP status code (e.g., 400, 401, 403, 404, 500)
 * @param message Human-readable error summary
 * @param error Optional error object, string, or details
 */
export const sendError = (
  reply: FastifyReply,
  statusCode: number,
  message: string,
  error?: unknown
): FastifyReply => {
  let errorMessage: string | undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  const responseBody: ApiResponse = {
    success: false,
    message,
    ...(errorMessage ? { error: errorMessage } : {}),
  };

  return reply.status(statusCode).send(responseBody);
};

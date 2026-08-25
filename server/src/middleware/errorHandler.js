import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { sendError } from "../utils/responseEnvelope.js";

export function errorHandler(err, req, res, _next) {
  logger.error(`[Unhandled Error] ${err.message}`, {
    requestId: req.id,
    userId: req.user ? req.user.id : null,
    path: req.path,
    method: req.method,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err.name === "ZodError") {
    return sendError(res, "Input validation failed", "VALIDATION_ERROR", 400, err.errors);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An internal server error occurred";
  const code = err.code || "INTERNAL_ERROR";

  const details = env.NODE_ENV === "development" && err.stack ? { stack: err.stack } : null;

  return sendError(res, message, code, statusCode, details);
}

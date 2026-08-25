import { rateLimit } from "express-rate-limit";
import { sendError } from "../utils/responseEnvelope.js";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Too many requests, please try again after 15 minutes", "TOO_MANY_REQUESTS", 429);
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Rate limit exceeded for this operation. Please wait a minute.", "RATE_LIMIT_EXCEEDED", 429);
  },
});

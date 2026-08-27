import { rateLimit } from "express-rate-limit";
import { sendError } from "../utils/responseEnvelope.js";

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000,
  skip: () => isDev,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Too many requests, please try again after 15 minutes", "TOO_MANY_REQUESTS", 429);
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 50,
  skip: () => isDev,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Rate limit exceeded for this operation. Please wait a minute.", "RATE_LIMIT_EXCEEDED", 429);
  },
});

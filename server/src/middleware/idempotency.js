import { sendSuccess } from "../utils/responseEnvelope.js";

// In-memory cache for idempotency keys within 24h
const idempotencyStore = new Map();

const CLEANUP_INTERVAL = 60 * 60 * 1000; // Clean expired keys every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.timestamp > 24 * 60 * 60 * 1000) {
      idempotencyStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return next();
  }

  const userPrefix = req.user ? req.user.id : "anonymous";
  const compoundKey = `${userPrefix}:${idempotencyKey}`;

  if (idempotencyStore.has(compoundKey)) {
    const cached = idempotencyStore.get(compoundKey);
    return sendSuccess(res, cached.data, { idempotencyReplay: true }, cached.statusCode);
  }

  // Intercept json response to cache
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success) {
      idempotencyStore.set(compoundKey, {
        timestamp: Date.now(),
        statusCode: res.statusCode,
        data: body.data,
      });
    }
    return originalJson(body);
  };

  next();
}

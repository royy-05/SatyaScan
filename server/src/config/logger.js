import { env } from "./env.js";

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  if (env.NODE_ENV === "production") {
    return JSON.stringify({
      timestamp,
      level,
      message,
      requestId: meta.requestId || null,
      userId: meta.userId || null,
      context: meta.context || meta,
    });
  } else {
    const reqStr = meta.requestId ? ` [req:${meta.requestId}]` : "";
    const userStr = meta.userId ? ` [user:${meta.userId}]` : "";
    const extra = Object.keys(meta).filter(k => !["requestId", "userId"].includes(k)).length > 0
      ? ` ${JSON.stringify(meta)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}]${reqStr}${userStr}: ${message}${extra}`;
  }
}

export const logger = {
  info: (message, meta) => console.log(formatLog("info", message, meta)),
  warn: (message, meta) => console.warn(formatLog("warn", message, meta)),
  error: (message, meta) => console.error(formatLog("error", message, meta)),
  debug: (message, meta) => {
    if (env.NODE_ENV !== "production") {
      console.log(formatLog("debug", message, meta));
    }
  },
};

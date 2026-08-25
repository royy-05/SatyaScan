import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./config/prisma.js";
import { aiService } from "./services/aiService.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initSocketServer } from "./sockets/index.js";
import { sendSuccess, sendError } from "./utils/responseEnvelope.js";

import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import configRoutes from "./routes/config.routes.js";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server);

// Security & Base Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware);
app.use(generalLimiter);

// Static file serving for uploaded document previews
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Liveness and Readiness Probes
app.get("/health", (_req, res) => {
  return sendSuccess(res, { status: "UP", timestamp: new Date().toISOString() });
});

app.get("/ready", async (_req, res) => {
  try {
    // Check Database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbStatus = "connected";

    // Check Python AI Service reachability
    const aiStatus = await aiService.checkHealth();

    const isReady = dbStatus === "connected" && aiStatus.reachable;

    if (!isReady) {
      return sendError(res, "Service not ready", "NOT_READY", 503, {
        db: dbStatus,
        ai: aiStatus,
      });
    }

    return sendSuccess(res, {
      status: "READY",
      db: dbStatus,
      ai: aiStatus,
    });
  } catch (err) {
    return sendError(res, `Readiness probe failed: ${err.message}`, "NOT_READY", 503);
  }
});

// Versioned API Routes (/api/v1)
const apiV1 = express.Router();
apiV1.use("/auth", authRoutes);
apiV1.use("/documents", documentRoutes);
apiV1.use("/reviews", reviewRoutes);
apiV1.use("/admin", adminRoutes);
apiV1.use("/config", configRoutes);

app.use("/api/v1", apiV1);

// 404 Route Handler
app.use((_req, res) => {
  return sendError(res, "Endpoint not found", "NOT_FOUND", 404);
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = env.PORT || 4000;

server.listen(PORT, () => {
  logger.info(`SatyaScan Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
});

export default app;

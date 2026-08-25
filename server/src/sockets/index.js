import { Server } from "socket.io";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

let ioInstance = null;

export function initSocketServer(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on("join:document", (documentId) => {
      socket.join(`document:${documentId}`);
      logger.info(`Socket ${socket.id} joined room document:${documentId}`);
    });

    socket.on("leave:document", (documentId) => {
      socket.leave(`document:${documentId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function emitDocumentStatus(documentId, status, payload = {}) {
  if (!ioInstance) return;
  
  const eventData = {
    documentId,
    status,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  ioInstance.to(`document:${documentId}`).emit("document:status", eventData);
  ioInstance.emit("document:update", eventData); // Broad update for review queue listeners
  logger.info(`Emitted socket status for document ${documentId}: ${status}`);
}

import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

export const auditService = {
  async log({ actorId, action, entityType, entityId, metadata = {}, ipAddress = null }) {
    try {
      const entry = await prisma.auditLog.create({
        data: {
          actorId,
          action,
          entityType,
          entityId,
          metadata,
          ipAddress,
        },
      });

      logger.info(`[AuditLog] ${action} on ${entityType}:${entityId} by user ${actorId || "SYSTEM"}`, {
        actorId,
        action,
        entityType,
        entityId,
      });

      return entry;
    } catch (err) {
      logger.error(`[AuditLog Failure] Failed to record audit log: ${err.message}`, {
        actorId,
        action,
        entityType,
        entityId,
      });
      // Do not throw to avoid crashing primary application flow
      return null;
    }
  },
};

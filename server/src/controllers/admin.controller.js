import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/hash.js";
import { auditService } from "../services/auditService.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/responseEnvelope.js";

const createUserSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["SUBMITTER", "OFFICER", "ADMIN"]),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["SUBMITTER", "OFFICER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export const adminController = {
  async getUsers(req, res, next) {
    try {
      const { search, role, page = 1, pageSize = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where = {
        deletedAt: null,
      };

      if (role) where.role = role;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [total, users] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

      return sendPaginated(res, users, total, pageNum, limitNum);
    } catch (err) {
      next(err);
    }
  },

  async createUser(req, res, next) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation error", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const { email, name, password, role } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return sendError(res, "User with this email already exists", "CONFLICT", 409);
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      await auditService.log({
        actorId: req.user.id,
        action: "ADMIN_CREATE_USER",
        entityType: "User",
        entityId: user.id,
        metadata: { email, role },
        ipAddress: req.ip,
      });

      return sendSuccess(res, user, {}, 201);
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation error", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return sendError(res, "User not found", "NOT_FOUND", 404);
      }

      const updateData = {};
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
      if (parsed.data.isDeleted) updateData.deletedAt = new Date();

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          deletedAt: true,
          updatedAt: true,
        },
      });

      await auditService.log({
        actorId: req.user.id,
        action: "ADMIN_UPDATE_USER",
        entityType: "User",
        entityId: id,
        metadata: parsed.data,
        ipAddress: req.ip,
      });

      return sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const { actorId, entityType, dateFrom, dateTo, page = 1, pageSize = 10 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where = {};
      if (actorId) where.actorId = actorId;
      if (entityType) where.entityType = entityType;

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [total, logs] = await prisma.$transaction([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          include: {
            actor: { select: { id: true, name: true, email: true, role: true } },
          },
        }),
      ]);

      return sendPaginated(res, logs, total, pageNum, limitNum);
    } catch (err) {
      next(err);
    }
  },

  async getStats(_req, res, next) {
    try {
      const totalDocs = await prisma.document.count({ where: { deletedAt: null } });

      const verifications = await prisma.verification.findMany({
        select: { verdict: true, createdAt: true },
      });

      const verdictCounts = { PASS: 0, REVIEW: 0, FAIL: 0 };
      verifications.forEach((v) => {
        if (verdictCounts[v.verdict] !== undefined) {
          verdictCounts[v.verdict]++;
        }
      });

      const totalVerifications = verifications.length;
      const flaggedCount = verdictCounts.REVIEW + verdictCounts.FAIL;
      const flagRate = totalVerifications > 0 ? (flaggedCount / totalVerifications) * 100 : 0;

      const totalReviews = await prisma.reviewDecision.count();
      const officerCount = await prisma.user.count({
        where: { role: "OFFICER", isActive: true, deletedAt: null },
      });

      const officerThroughput = officerCount > 0 ? (totalReviews / officerCount).toFixed(1) : 0;

      // Group submissions by day for the last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split("T")[0];

        const dayStart = new Date(dayStr);
        const dayEnd = new Date(dayStr);
        dayEnd.setHours(23, 59, 59, 999);

        const count = await prisma.document.count({
          where: {
            deletedAt: null,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        });

        days.push({ day: dayStr, count });
      }

      return sendSuccess(res, {
        totalDocs,
        totalVerifications,
        verdictCounts,
        flagRate: parseFloat(flagRate.toFixed(2)),
        totalReviews,
        officerThroughput: parseFloat(officerThroughput),
        dailySubmissions: days,
      });
    } catch (err) {
      next(err);
    }
  },
};

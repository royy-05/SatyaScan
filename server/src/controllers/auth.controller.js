import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { comparePassword, hashPassword, hashString } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { auditService } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseEnvelope.js";
import { env } from "../config/env.js";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSubmitterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const registerOfficerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  contactNumber: z.string().min(8, "Contact number is required"),
  registrationReason: z.string().min(20, "Reason must be at least 20 characters"),
  inviteCode: z.string().min(1, "Invitation code is required"),
});

export const authController = {
  async login(req, res, next) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation failed", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive || user.deletedAt) {
        return sendError(res, "Invalid email or password", "INVALID_CREDENTIALS", 401);
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, "Invalid email or password", "INVALID_CREDENTIALS", 401);
      }

      if (user.status === "PENDING_APPROVAL") {
        return sendError(
          res,
          "Your account is awaiting administrator approval.",
          "PENDING_APPROVAL",
          403
        );
      }
      if (user.status === "REJECTED") {
        return sendError(
          res,
          "Your account registration was not approved.",
          "REGISTRATION_REJECTED",
          403
        );
      }

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });

      const tokenHash = hashString(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await auditService.log({
        actorId: user.id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.ip,
      });

      const { passwordHash: _, ...safeUser } = user;

      return sendSuccess(res, {
        accessToken,
        refreshToken,
        user: safeUser,
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, "Refresh token required", "BAD_REQUEST", 400);
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload || !payload.userId) {
        return sendError(res, "Invalid or expired refresh token", "UNAUTHORIZED", 401);
      }

      const tokenHash = hashString(refreshToken);
      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
        return sendError(res, "Refresh token has been revoked or expired", "UNAUTHORIZED", 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive || user.deletedAt) {
        return sendError(res, "User account is inactive", "FORBIDDEN", 403);
      }

      const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });

      return sendSuccess(res, {
        accessToken: newAccessToken,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        const tokenHash = hashString(refreshToken);
        await prisma.refreshToken.updateMany({
          where: { tokenHash },
          data: { revokedAt: new Date() },
        });
      }

      if (req.user) {
        await auditService.log({
          actorId: req.user.id,
          action: "USER_LOGOUT",
          entityType: "User",
          entityId: req.user.id,
          ipAddress: req.ip,
        });
      }

      return sendSuccess(res, { message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    const { passwordHash: _, ...safeUser } = req.user;
    return sendSuccess(res, safeUser);
  },

  async register(_req, res) {
    return sendError(
      res,
      "Registration is disabled. Use /register/submitter or /register/officer.",
      "FORBIDDEN",
      403
    );
  },

  async registerSubmitter(req, res, next) {
    try {
      const parsed = registerSubmitterSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation failed", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const { email, name, password } = parsed.data;

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
          role: "SUBMITTER",
          status: "APPROVED",
          isActive: true,
        },
      });

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });

      const tokenHash = hashString(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await auditService.log({
        actorId: user.id,
        action: "SUBMITTER_SELF_REGISTERED",
        entityType: "User",
        entityId: user.id,
        ipAddress: req.ip,
      });

      const { passwordHash: _, ...safeUser } = user;

      return sendSuccess(
        res,
        {
          accessToken,
          refreshToken,
          user: safeUser,
        },
        {},
        201
      );
    } catch (err) {
      next(err);
    }
  },

  async registerOfficer(req, res, next) {
    try {
      const parsed = registerOfficerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, "Validation failed", "VALIDATION_ERROR", 400, parsed.error.errors);
      }

      const { email, name, password, contactNumber, registrationReason, inviteCode } = parsed.data;

      if (inviteCode !== env.OFFICER_INVITE_CODE) {
        return sendError(res, "Invalid invitation code", "INVALID_INVITE_CODE", 403);
      }

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
          role: "OFFICER",
          status: "PENDING_APPROVAL",
          isActive: true,
          contactNumber,
          registrationReason,
        },
      });

      await auditService.log({
        actorId: user.id,
        action: "OFFICER_SELF_REGISTERED",
        entityType: "User",
        entityId: user.id,
        metadata: { registrationReason, contactNumber },
        ipAddress: req.ip,
      });

      return sendSuccess(
        res,
        { message: "Registration submitted. Awaiting admin approval." },
        {},
        201
      );
    } catch (err) {
      next(err);
    }
  },
};

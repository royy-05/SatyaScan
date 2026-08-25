import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { comparePassword, hashString } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { auditService } from "../services/auditService.js";
import { sendSuccess, sendError } from "../utils/responseEnvelope.js";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
      "Registration is disabled. Please contact a system administrator for an account invitation.",
      "FORBIDDEN",
      403
    );
  },
};

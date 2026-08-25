import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { sendError } from "../utils/responseEnvelope.js";

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Access token required", "UNAUTHORIZED", 401);
  }

  const payload = verifyAccessToken(token);
  if (!payload || !payload.userId) {
    return sendError(res, "Invalid or expired access token", "UNAUTHORIZED", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return sendError(res, "User account is inactive or disabled", "FORBIDDEN", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, `Authentication error: ${err.message}`, "INTERNAL_SERVER_ERROR", 500);
  }
}

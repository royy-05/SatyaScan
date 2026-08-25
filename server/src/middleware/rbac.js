import { sendError } from "../utils/responseEnvelope.js";

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", "UNAUTHORIZED", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`,
        "FORBIDDEN",
        403
      );
    }

    next();
  };
}

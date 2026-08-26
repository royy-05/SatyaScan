import { Router } from "express";
import { documentController } from "../controllers/document.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { uploadMiddleware, handleUploadError } from "../middleware/upload.js";
import { strictLimiter } from "../middleware/rateLimit.js";
import { idempotencyMiddleware } from "../middleware/idempotency.js";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  requireRole("SUBMITTER"),
  strictLimiter,
  idempotencyMiddleware,
  uploadMiddleware.single("file"),
  handleUploadError,
  documentController.upload
);

router.get("/", documentController.list);
router.get("/:id", documentController.getById);
router.post("/:id/reverify", requireRole("ADMIN"), documentController.reverify);
router.post(
  "/:id/face-verify",
  uploadMiddleware.single("selfie"),
  handleUploadError,
  documentController.faceVerify
);

export default router;

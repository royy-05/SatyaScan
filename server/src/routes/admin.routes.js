import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

router.use(authenticateToken);
router.use(requireRole("ADMIN"));

router.get("/users", adminController.getUsers);
router.get("/users/pending", requireRole("ADMIN"), adminController.getPendingUsers);
router.post("/users", adminController.createUser);
router.patch("/users/:id", adminController.updateUser);
router.patch("/users/:id/approve", requireRole("ADMIN"), adminController.approveUser);
router.patch("/users/:id/reject", requireRole("ADMIN"), adminController.rejectUser);
router.get("/audit", adminController.getAuditLogs);
router.get("/stats", adminController.getStats);

export default router;

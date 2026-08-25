import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

router.use(authenticateToken);

router.get("/queue", requireRole("OFFICER", "ADMIN"), reviewController.getQueue);
router.post("/:documentId", requireRole("OFFICER", "ADMIN"), reviewController.submitDecision);
router.get("/mine", requireRole("OFFICER"), reviewController.getMyReviews);

export default router;

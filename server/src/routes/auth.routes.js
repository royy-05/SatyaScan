import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { strictLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/login", strictLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/register", authController.register);
router.post("/register/submitter", strictLimiter, authController.registerSubmitter);
router.post("/register/officer", strictLimiter, authController.registerOfficer);
router.get("/me", authenticateToken, authController.me);

export default router;

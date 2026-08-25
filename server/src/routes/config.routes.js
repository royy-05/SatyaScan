import { Router } from "express";
import { configController } from "../controllers/config.controller.js";

const router = Router();

router.get("/doc-types", configController.getDocTypes);
router.get("/scoring", configController.getScoringConfig);

export default router;

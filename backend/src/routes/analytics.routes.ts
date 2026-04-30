import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/summary", AnalyticsController.getSummary);
router.get("/heatmap", AnalyticsController.getHeatmap);
router.get("/velocity", AnalyticsController.getVelocity);
router.get("/burndown/:projectId", AnalyticsController.getBurndown);

export default router;

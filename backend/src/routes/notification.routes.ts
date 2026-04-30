import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", NotificationController.list);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export default router;

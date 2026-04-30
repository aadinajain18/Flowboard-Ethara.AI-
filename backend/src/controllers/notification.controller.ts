import { Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { AuthRequest } from "../types";

export class NotificationController {
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const [notifications, unreadCount] = await Promise.all([
        NotificationService.getByUser(req.user!.userId, limit),
        NotificationService.getUnreadCount(req.user!.userId),
      ]);
      res.json({ success: true, data: { notifications, unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAsRead(req.params.id, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
}

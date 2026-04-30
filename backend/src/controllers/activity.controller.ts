import { Response, NextFunction } from "express";
import { ActivityService } from "../services/activity.service";
import { AuthRequest } from "../types";

export class ActivityController {
  static async getByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await ActivityService.getByProject(
        req.params.projectId,
        page,
        limit
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getRecent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 15;
      const activities = await ActivityService.getRecent(
        req.user!.userId,
        limit
      );
      res.json({ success: true, data: activities });
    } catch (err) {
      next(err);
    }
  }
}

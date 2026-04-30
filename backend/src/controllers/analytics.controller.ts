import { Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { AuthRequest } from "../types";

export class AnalyticsController {
  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getSummary(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getHeatmap(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getCompletionHeatmap(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getVelocity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getVelocity(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getBurndown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const data = await AnalyticsService.getProjectBurndown(projectId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

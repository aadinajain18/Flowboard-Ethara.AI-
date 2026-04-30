import { Response, NextFunction } from "express";
import { TaskService } from "../services/task.service";
import { AuthRequest } from "../types";

export class TaskController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.create(
        req.params.projectId,
        req.body,
        req.user!.userId
      );
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async listByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, assigneeId, search } = req.query;
      const tasks = await TaskService.listByProject(
        req.params.projectId,
        req.user!.userId,
        {
          status: status as string,
          priority: priority as string,
          assigneeId: assigneeId as string,
          search: search as string,
        }
      );
      res.json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.getById(req.params.id, req.user!.userId);
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.updateStatus(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await TaskService.delete(req.params.id, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await TaskService.addComment(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  }

  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await TaskService.getDashboardData(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

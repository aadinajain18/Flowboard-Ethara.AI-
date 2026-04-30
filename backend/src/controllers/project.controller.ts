import { Response, NextFunction } from "express";
import { ProjectService } from "../services/project.service";
import { AuthRequest } from "../types";

export class ProjectController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.listForUser(req.user!.userId);
      res.json({ success: true, data: projects });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getById(
        req.params.id,
        req.user!.userId
      );
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.delete(req.params.id, req.user!.userId);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await ProjectService.addMember(
        req.params.id,
        req.body,
        req.user!.userId
      );
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      next(err);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ProjectService.removeMember(
        req.params.id,
        req.params.userId,
        req.user!.userId
      );
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
}

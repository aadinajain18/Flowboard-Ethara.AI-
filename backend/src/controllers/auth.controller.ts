import { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../types";

export class AuthController {
  static async signup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

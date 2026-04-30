import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/AppError";
import { AuthRequest } from "../types";

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid token");
    }
    const token = header.split(" ")[1];
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError("Insufficient permissions"));
    }
    next();
  };
}

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}

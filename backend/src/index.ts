import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { requestLogger } from "./middleware/logger.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import activityRoutes from "./routes/activity.routes";
import notificationRoutes from "./routes/notification.routes";
import analyticsRoutes from "./routes/analytics.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Performance Middleware ──────────────────
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests, try again later" },
});
app.use(limiter);

// Request logging
app.use(requestLogger);

// ─── Health Check ───────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "FlowBoard API",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// ─── Error Handling ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FlowBoard API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;

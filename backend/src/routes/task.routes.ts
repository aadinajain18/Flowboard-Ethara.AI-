import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  createCommentSchema,
} from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

// Dashboard (must come before /:id)
router.get("/dashboard", TaskController.getDashboard);

// Task CRUD by project
router.post("/project/:projectId", validate(createTaskSchema), TaskController.create);
router.get("/project/:projectId", TaskController.listByProject);

// Single task operations
router.get("/:id", TaskController.getById);
router.put("/:id", validate(updateTaskSchema), TaskController.update);
router.patch("/:id/status", validate(updateTaskStatusSchema), TaskController.updateStatus);
router.delete("/:id", TaskController.delete);

// Comments
router.post("/:id/comments", validate(createCommentSchema), TaskController.addComment);

export default router;

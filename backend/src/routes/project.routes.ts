import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../schemas/project.schema";

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post("/", validate(createProjectSchema), ProjectController.create);
router.get("/", ProjectController.list);
router.get("/:id", ProjectController.getById);
router.put("/:id", validate(updateProjectSchema), ProjectController.update);
router.delete("/:id", ProjectController.delete);

// Member management
router.post("/:id/members", validate(addMemberSchema), ProjectController.addMember);
router.delete("/:id/members/:userId", ProjectController.removeMember);

export default router;

import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(2, "Title is required").max(200),
  description: z.string().optional().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  dueDate: z.string().min(1, "Due date is required"),
  assigneeId: z.string().min(1, "Assignee is required"),
  parentId: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  position: z.number().int().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  position: z.number().int().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

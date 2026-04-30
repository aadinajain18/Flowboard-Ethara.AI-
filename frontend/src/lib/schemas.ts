import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  assigneeId: z.string().min(1, "Assignee is required"),
});

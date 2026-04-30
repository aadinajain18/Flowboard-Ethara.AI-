import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  color: z.string().optional().default("#6366f1"),
  icon: z.string().optional().default("folder"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;

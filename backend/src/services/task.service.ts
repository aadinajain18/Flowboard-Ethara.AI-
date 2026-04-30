import prisma from "../prisma";
import {
  NotFoundError,
  ForbiddenError,
} from "../utils/AppError";
import { ActivityService } from "./activity.service";
import { NotificationService } from "./notification.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  CreateCommentInput,
} from "../schemas/task.schema";

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatarColor: true } },
  createdBy: { select: { id: true, name: true, avatarColor: true } },
  project: { select: { id: true, name: true, color: true } },
  subtasks: {
    select: { id: true, title: true, status: true },
  },
  labels: true,
  _count: { select: { comments: true, subtasks: true } },
};

export class TaskService {
  /**
   * Create a task within a project.
   */
  static async create(
    projectId: string,
    input: CreateTaskInput,
    userId: string
  ) {
    // Verify user is a member of the project
    await this.assertProjectMember(projectId, userId);

    // Verify assignee is a member
    await this.assertProjectMember(projectId, input.assigneeId);

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description || "",
        status: input.status || "TODO",
        priority: input.priority || "MEDIUM",
        dueDate: new Date(input.dueDate),
        projectId,
        assigneeId: input.assigneeId,
        createdById: userId,
        parentId: input.parentId || null,
      },
      include: taskInclude,
    });

    await ActivityService.log({
      action: "CREATED",
      entityType: "task",
      entityId: task.id,
      entityTitle: task.title,
      projectId,
      userId,
    });

    // Notify assignee if different from creator
    if (input.assigneeId !== userId) {
      await NotificationService.create({
        type: "task_assigned",
        title: "Task assigned to you",
        message: `"${task.title}" in ${task.project?.name}`,
        entityId: task.id,
        userId: input.assigneeId,
      });
    }

    return task;
  }

  /**
   * List tasks for a project with optional filters.
   */
  static async listByProject(
    projectId: string,
    userId: string,
    filters: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      search?: string;
    } = {}
  ) {
    await this.assertProjectMember(projectId, userId);

    const where: any = { projectId, parentId: null };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    });

    // Add overdue flag
    const now = new Date();
    return tasks.map((task) => ({
      ...task,
      overdue: task.status !== "DONE" && new Date(task.dueDate) < now,
    }));
  }

  /**
   * Get a single task by ID.
   */
  static async getById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        ...taskInclude,
        comments: {
          include: {
            user: { select: { id: true, name: true, avatarColor: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarColor: true } },
          },
        },
      },
    });

    if (!task) throw new NotFoundError("Task not found");

    await this.assertProjectMember(task.projectId, userId);

    const now = new Date();
    return {
      ...task,
      overdue: task.status !== "DONE" && new Date(task.dueDate) < now,
    };
  }

  /**
   * Update a task.
   */
  static async update(
    taskId: string,
    input: UpdateTaskInput,
    userId: string
  ) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new NotFoundError("Task not found");

    await this.assertProjectMember(existing.projectId, userId);

    if (input.assigneeId) {
      await this.assertProjectMember(existing.projectId, input.assigneeId);
    }

    const data: any = { ...input };
    if (input.dueDate) data.dueDate = new Date(input.dueDate);

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: taskInclude,
    });

    // Log status change specifically
    if (input.status && input.status !== existing.status) {
      await ActivityService.log({
        action: "STATUS_CHANGED",
        entityType: "task",
        entityId: task.id,
        entityTitle: task.title,
        details: `${existing.status} → ${input.status}`,
        projectId: task.projectId,
        userId,
      });
    } else {
      await ActivityService.log({
        action: "UPDATED",
        entityType: "task",
        entityId: task.id,
        entityTitle: task.title,
        details: `Updated: ${Object.keys(input).join(", ")}`,
        projectId: task.projectId,
        userId,
      });
    }

    // Notify new assignee
    if (input.assigneeId && input.assigneeId !== existing.assigneeId && input.assigneeId !== userId) {
      await NotificationService.create({
        type: "task_assigned",
        title: "Task reassigned to you",
        message: `"${task.title}" in ${task.project?.name}`,
        entityId: task.id,
        userId: input.assigneeId,
      });
    }

    const now = new Date();
    return {
      ...task,
      overdue: task.status !== "DONE" && new Date(task.dueDate) < now,
    };
  }

  /**
   * Quick status update (for Kanban drag-and-drop).
   */
  static async updateStatus(
    taskId: string,
    input: UpdateTaskStatusInput,
    userId: string
  ) {
    return this.update(taskId, input, userId);
  }

  /**
   * Delete a task.
   */
  static async delete(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError("Task not found");

    await this.assertProjectMember(task.projectId, userId);

    await ActivityService.log({
      action: "DELETED",
      entityType: "task",
      entityId: task.id,
      entityTitle: task.title,
      projectId: task.projectId,
      userId,
    });

    await prisma.task.delete({ where: { id: taskId } });
  }

  /**
   * Add a comment to a task.
   */
  static async addComment(
    taskId: string,
    input: CreateCommentInput,
    userId: string
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError("Task not found");

    await this.assertProjectMember(task.projectId, userId);

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    await ActivityService.log({
      action: "COMMENTED",
      entityType: "task",
      entityId: task.id,
      entityTitle: task.title,
      details: input.content.slice(0, 100),
      projectId: task.projectId,
      userId,
    });

    // Notify assignee about the comment
    if (task.assigneeId !== userId) {
      await NotificationService.create({
        type: "comment",
        title: "New comment on your task",
        message: `Comment on "${task.title}": ${input.content.slice(0, 80)}`,
        entityId: taskId,
        userId: task.assigneeId,
      });
    }

    return comment;
  }

  /**
   * Dashboard aggregation — stats, charts, recent tasks.
   */
  static async getDashboardData(userId: string) {
    // Get all projects the user is part of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });

    const projectIds = [
      ...new Set([
        ...memberships.map((m) => m.projectId),
        ...ownedProjects.map((p) => p.id),
      ]),
    ];

    const now = new Date();

    const [total, inProgress, completed, overdue, teamMembers] =
      await Promise.all([
        prisma.task.count({ where: { projectId: { in: projectIds } } }),
        prisma.task.count({
          where: { projectId: { in: projectIds }, status: "IN_PROGRESS" },
        }),
        prisma.task.count({
          where: { projectId: { in: projectIds }, status: "DONE" },
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            status: { not: "DONE" },
            dueDate: { lt: now },
          },
        }),
        prisma.projectMember.findMany({
          where: { projectId: { in: projectIds } },
          select: { userId: true },
          distinct: ["userId"],
        }),
      ]);

    // Tasks by status
    const byStatus = [
      { status: "TODO", count: total - inProgress - completed },
      { status: "IN_PROGRESS", count: inProgress },
      { status: "DONE", count: completed },
    ];

    // Tasks by priority
    const [low, medium, high, urgent] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds }, priority: "LOW" } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, priority: "MEDIUM" } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, priority: "HIGH" } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, priority: "URGENT" } }),
    ]);
    const byPriority = [
      { priority: "LOW", count: low },
      { priority: "MEDIUM", count: medium },
      { priority: "HIGH", count: high },
      { priority: "URGENT", count: urgent },
    ];

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignee: { select: { id: true, name: true, avatarColor: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const tasksWithOverdue = recentTasks.map((t) => ({
      ...t,
      overdue: t.status !== "DONE" && new Date(t.dueDate) < now,
    }));

    // Recent activities
    const recentActivities = await ActivityService.getRecent(userId, 10);

    // Member workload
    const memberWorkload = await prisma.task.groupBy({
      by: ["assigneeId"],
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    });

    const workloadUsers = await prisma.user.findMany({
      where: { id: { in: memberWorkload.map((m) => m.assigneeId) } },
      select: { id: true, name: true, avatarColor: true },
    });

    const memberWorkloadData = memberWorkload.map((m) => ({
      user: workloadUsers.find((u) => u.id === m.assigneeId) || {
        id: m.assigneeId,
        name: "Unknown",
        avatarColor: "#6366f1",
      },
      taskCount: m._count.id,
    }));

    return {
      stats: {
        total,
        inProgress,
        completed,
        overdue,
        teamMembers: teamMembers.length,
      },
      byStatus,
      byPriority,
      recentTasks: tasksWithOverdue,
      recentActivities,
      memberWorkload: memberWorkloadData,
    };
  }

  // ─── Internal Helpers ─────────────────────────────────

  private static async assertProjectMember(
    projectId: string,
    userId: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    if (!project) throw new NotFoundError("Project not found");
    if (project.ownerId === userId) return;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!membership)
      throw new ForbiddenError("Not a member of this project");
  }
}

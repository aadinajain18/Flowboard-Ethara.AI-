import prisma from "../prisma";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "../utils/AppError";
import { ActivityService } from "./activity.service";
import { NotificationService } from "./notification.service";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
} from "../schemas/project.schema";

export class ProjectService {
  /**
   * Create a new project. Creator becomes ADMIN member automatically.
   */
  static async create(input: CreateProjectInput, userId: string) {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        color: input.color || "#6366f1",
        icon: input.icon || "folder",
        ownerId: userId,
        members: {
          create: { userId, role: "ADMIN" },
        },
      },
      include: {
        owner: { select: { id: true, name: true, avatarColor: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    await ActivityService.log({
      action: "CREATED",
      entityType: "project",
      entityId: project.id,
      entityTitle: project.name,
      projectId: project.id,
      userId,
    });

    return project;
  }

  /**
   * List all projects the user is a member of or owns.
   */
  static async listForUser(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, avatarColor: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, avatarColor: true } },
          },
          take: 5,
        },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Get a single project with full details.
   */
  static async getById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarColor: true } },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarColor: true, role: true },
            },
          },
        },
        _count: { select: { tasks: true, members: true } },
      },
    });

    if (!project) throw new NotFoundError("Project not found");

    // Check membership
    const isMember = project.members.some((m) => m.userId === userId);
    const isOwner = project.ownerId === userId;
    if (!isMember && !isOwner) throw new ForbiddenError("Not a project member");

    return project;
  }

  /**
   * Update a project (Admin only).
   */
  static async update(
    projectId: string,
    input: UpdateProjectInput,
    userId: string
  ) {
    await this.assertProjectAdmin(projectId, userId);

    const project = await prisma.project.update({
      where: { id: projectId },
      data: input,
      include: {
        owner: { select: { id: true, name: true, avatarColor: true } },
        _count: { select: { tasks: true, members: true } },
      },
    });

    await ActivityService.log({
      action: "UPDATED",
      entityType: "project",
      entityId: project.id,
      entityTitle: project.name,
      details: `Updated: ${Object.keys(input).join(", ")}`,
      projectId: project.id,
      userId,
    });

    return project;
  }

  /**
   * Delete a project (Admin only).
   */
  static async delete(projectId: string, userId: string) {
    await this.assertProjectAdmin(projectId, userId);
    await prisma.project.delete({ where: { id: projectId } });
  }

  /**
   * Add a member to a project by email.
   */
  static async addMember(
    projectId: string,
    input: AddMemberInput,
    userId: string
  ) {
    await this.assertProjectAdmin(projectId, userId);

    const userToAdd = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, name: true },
    });
    if (!userToAdd) throw new NotFoundError("User not found with that email");

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });
    if (existing) throw new ConflictError("User is already a member");

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: input.role || "MEMBER",
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true } },
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true },
    });

    await ActivityService.log({
      action: "MEMBER_ADDED",
      entityType: "member",
      entityId: userToAdd.id,
      entityTitle: userToAdd.name,
      projectId,
      userId,
    });

    await NotificationService.create({
      type: "member_added",
      title: "Added to project",
      message: `You were added to "${project?.name}"`,
      entityId: projectId,
      userId: userToAdd.id,
    });

    return member;
  }

  /**
   * Remove a member from a project.
   */
  static async removeMember(
    projectId: string,
    memberUserId: string,
    userId: string
  ) {
    await this.assertProjectAdmin(projectId, userId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (project?.ownerId === memberUserId) {
      throw new BadRequestError("Cannot remove the project owner");
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberUserId } },
    });
    if (!membership) throw new NotFoundError("Member not found");

    await prisma.projectMember.delete({ where: { id: membership.id } });

    const removedUser = await prisma.user.findUnique({
      where: { id: memberUserId },
      select: { name: true },
    });

    await ActivityService.log({
      action: "MEMBER_REMOVED",
      entityType: "member",
      entityId: memberUserId,
      entityTitle: removedUser?.name || "Unknown",
      projectId,
      userId,
    });
  }

  /**
   * Get task statistics for a project (for dashboard-like views).
   */
  static async getProjectStats(projectId: string) {
    const [total, todo, inProgress, done] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.count({ where: { projectId, status: "TODO" } }),
      prisma.task.count({ where: { projectId, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { projectId, status: "DONE" } }),
    ]);
    return { total, todo, inProgress, done };
  }

  // ─── Internal Helpers ─────────────────────────────────

  private static async assertProjectAdmin(
    projectId: string,
    userId: string
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
    if (!project) throw new NotFoundError("Project not found");

    const isOwner = project.ownerId === userId;
    const isAdmin = project.members.some(
      (m) => m.userId === userId && m.role === "ADMIN"
    );

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Only project admins can perform this action");
    }
  }
}

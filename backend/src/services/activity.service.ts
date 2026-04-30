import prisma from "../prisma";
import { ActivityAction } from "@prisma/client";

interface LogActivityParams {
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityTitle: string;
  details?: string;
  projectId: string;
  userId: string;
}

export class ActivityService {
  static async log(params: LogActivityParams) {
    return prisma.activity.create({
      data: params,
    });
  }

  static async getByProject(projectId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { projectId },
        include: {
          user: { select: { id: true, name: true, avatarColor: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where: { projectId } }),
    ]);
    return { activities, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getRecent(userId: string, limit = 15) {
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

    return prisma.activity.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: { select: { id: true, name: true, avatarColor: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

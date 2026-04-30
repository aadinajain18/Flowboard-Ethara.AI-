import prisma from "../prisma";

interface CreateNotificationParams {
  type: string;
  title: string;
  message: string;
  entityId?: string;
  userId: string;
}

export class NotificationService {
  static async create(params: CreateNotificationParams) {
    return prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        entityId: params.entityId || null,
        userId: params.userId,
      },
    });
  }

  static async getByUser(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

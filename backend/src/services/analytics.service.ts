import prisma from "../prisma";

export class AnalyticsService {
  /**
   * Get task completion heatmap data (last 365 days)
   * Returns { date: string, count: number }[]
   */
  static async getCompletionHeatmap(userId: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get all tasks completed (status=DONE) by date
    const tasks = await prisma.task.findMany({
      where: {
        updatedAt: { gte: oneYearAgo },
        status: "DONE",
        project: {
          members: { some: { userId } },
        },
      },
      select: { updatedAt: true },
    });

    // Group by date
    const dateMap: Record<string, number> = {};
    tasks.forEach((t: { updatedAt: Date }) => {
      const day = t.updatedAt.toISOString().split("T")[0];
      dateMap[day] = (dateMap[day] || 0) + 1;
    });

    return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
  }

  /**
   * Get velocity data — tasks completed per week (last 12 weeks)
   */
  static async getVelocity(userId: string) {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const tasks = await prisma.task.findMany({
      where: {
        updatedAt: { gte: twelveWeeksAgo },
        status: "DONE",
        project: {
          members: { some: { userId } },
        },
      },
      select: { updatedAt: true },
    });

    // Group by ISO week
    const weeks: Record<string, number> = {};
    tasks.forEach((t: { updatedAt: Date }) => {
      const d = t.updatedAt;
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const weekKey = startOfWeek.toISOString().split("T")[0];
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    // Fill in empty weeks
    const result: { week: string; completed: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      d.setDate(d.getDate() - d.getDay());
      const weekKey = d.toISOString().split("T")[0];
      result.push({
        week: weekKey,
        completed: weeks[weekKey] || 0,
      });
    }

    return result;
  }

  /**
   * Get burndown data per project
   */
  static async getProjectBurndown(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: { status: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project || project.tasks.length === 0) return [];

    const startDate = project.tasks[0].createdAt;
    const endDate = new Date();
    const days: { date: string; remaining: number; ideal: number }[] = [];
    const totalTasks = project.tasks.length;

    // Build day-by-day burndown
    const current = new Date(startDate);
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];
      const completedByDate = project.tasks.filter(
        (t: { status: string; updatedAt: Date }) =>
          t.status === "DONE" &&
          t.updatedAt.toISOString().split("T")[0] <= dateStr
      ).length;

      const dayIndex = Math.ceil(
        (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      days.push({
        date: dateStr,
        remaining: totalTasks - completedByDate,
        ideal: Math.max(
          0,
          totalTasks - (totalTasks * dayIndex) / Math.max(totalDays, 1)
        ),
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  /**
   * Get comprehensive analytics summary
   */
  static async getSummary(userId: string) {
    const userProjects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, color: true },
    });

    const projectIds = userProjects.map((p: { id: string }) => p.id);

    const [totalTasks, completedTasks, overdueTasks, avgCompletionData] =
      await Promise.all([
        prisma.task.count({ where: { projectId: { in: projectIds } } }),
        prisma.task.count({
          where: { projectId: { in: projectIds }, status: "DONE" },
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            status: { not: "DONE" },
            dueDate: { lt: new Date() },
          },
        }),
        // Average tasks per project
        prisma.task.groupBy({
          by: ["projectId"],
          where: { projectId: { in: projectIds } },
          _count: true,
        }),
      ]);

    // Per-project stats for radar/comparison
    const projectStats = await Promise.all(
      userProjects.map(async (p: { id: string; name: string; color: string }) => {
        const [total, done, overdue] = await Promise.all([
          prisma.task.count({ where: { projectId: p.id } }),
          prisma.task.count({ where: { projectId: p.id, status: "DONE" } }),
          prisma.task.count({
            where: {
              projectId: p.id,
              status: { not: "DONE" },
              dueDate: { lt: new Date() },
            },
          }),
        ]);
        return {
          projectId: p.id,
          name: p.name,
          color: p.color,
          total,
          completed: done,
          overdue,
          completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate:
        totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0,
      projectStats,
      projects: userProjects,
    };
  }
}

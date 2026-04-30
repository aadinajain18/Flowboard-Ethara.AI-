import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ListTodo,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Users,
  Plus,
  FolderPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, unwrap } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { SkeletonCards, SkeletonChart, SkeletonRows } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { AnimatedEmptyState } from "../components/ui/AnimatedEmptyState";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { StatCard } from "../components/dashboard/StatCards";
import { StatusChart, PriorityChart } from "../components/dashboard/Charts";
import { WorkloadChart } from "../components/dashboard/WorkloadChart";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { RecentTasks } from "../components/dashboard/RecentTasks";
import type { DashboardData } from "../types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => unwrap<DashboardData>(api.get("/api/tasks/dashboard")),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-20 rounded-xl" />
        <SkeletonCards count={5} />
        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonRows rows={4} />
      </div>
    );
  }

  if (!data || data.stats.total === 0) {
    return (
      <AnimatedEmptyState
        variant="projects"
        title="No tasks yet"
        description="Create a project and add tasks to populate your dashboard with real-time analytics."
        action={
          <Link to="/projects" className="btn">
            <FolderPlus size={16} />
            Create your first project
          </Link>
        }
      />
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Total Tasks",
      value: data.stats.total,
      icon: ListTodo,
      color: "#8B6085",
      gradient: "linear-gradient(135deg, #8B6085, #6B2D68)",
    },
    {
      label: "In Progress",
      value: data.stats.inProgress,
      icon: Clock3,
      color: "#6B9EC4",
      gradient: "linear-gradient(135deg, #6B9EC4, #4A7BA0)",
    },
    {
      label: "Completed",
      value: data.stats.completed,
      icon: CheckCircle2,
      color: "#7CB87C",
      gradient: "linear-gradient(135deg, #7CB87C, #5A9A5A)",
    },
    {
      label: "Overdue",
      value: data.stats.overdue,
      icon: AlertTriangle,
      color: "#C75050",
      gradient: "linear-gradient(135deg, #C75050, #A04040)",
    },
    {
      label: "Team Members",
      value: data.stats.teamMembers,
      icon: Users,
      color: "#C9A87C",
      gradient: "linear-gradient(135deg, #C9A87C, #B8962A)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <SpotlightCard className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Here's what's happening across your projects today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/projects" className="btn-ghost text-xs">
              <FolderPlus size={14} />
              New Project
            </Link>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={data.byStatus} total={data.stats.total} />
        <PriorityChart data={data.byPriority} />
      </div>

      {/* Workload + Activity Row */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <WorkloadChart data={data.memberWorkload} />
        <ActivityFeed activities={data.recentActivities} />
      </div>

      {/* Recent Tasks */}
      <RecentTasks tasks={data.recentTasks} />
    </div>
  );
}

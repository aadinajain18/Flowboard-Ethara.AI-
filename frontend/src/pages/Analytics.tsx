import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { api, unwrap } from "../lib/api";
import { Heatmap } from "../components/analytics/Heatmap";

interface Summary {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  projectStats: {
    projectId: string;
    name: string;
    color: string;
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
  }[];
  projects: { id: string; name: string; color: string }[];
}

interface VelocityItem {
  week: string;
  completed: number;
}

interface BurndownItem {
  date: string;
  remaining: number;
  ideal: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border border-glass px-3 py-2 text-xs"
      style={{ background: "var(--bg-overlay)" }}
    >
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function Analytics() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: summary } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => unwrap<Summary>(api.get("/api/analytics/summary")),
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["analytics", "heatmap"],
    queryFn: () =>
      unwrap<{ date: string; count: number }[]>(
        api.get("/api/analytics/heatmap")
      ),
  });

  const { data: velocity } = useQuery({
    queryKey: ["analytics", "velocity"],
    queryFn: () =>
      unwrap<VelocityItem[]>(api.get("/api/analytics/velocity")),
  });

  const projectId =
    selectedProject || summary?.projects?.[0]?.id || "";

  const { data: burndown } = useQuery({
    queryKey: ["analytics", "burndown", projectId],
    queryFn: () =>
      unwrap<BurndownItem[]>(
        api.get(`/api/analytics/burndown/${projectId}`)
      ),
    enabled: !!projectId,
  });

  const stats = [
    {
      label: "Completion Rate",
      value: `${summary?.completionRate || 0}%`,
      icon: Target,
      color: "#8B6085",
      bg: "rgba(99,102,241,0.1)",
    },
    {
      label: "Tasks Completed",
      value: summary?.completedTasks || 0,
      icon: CheckCircle2,
      color: "#7CB87C",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      label: "Total Tasks",
      value: summary?.totalTasks || 0,
      icon: BarChart3,
      color: "#6B9EC4",
      bg: "rgba(59,130,246,0.1)",
    },
    {
      label: "Overdue",
      value: summary?.overdueTasks || 0,
      icon: AlertTriangle,
      color: "#C75050",
      bg: "rgba(239,68,68,0.1)",
    },
  ];

  // Format velocity chart labels
  const velocityFormatted = (velocity || []).map((v) => ({
    ...v,
    label: new Date(v.week).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Format burndown chart labels
  const burndownFormatted = (burndown || []).map((b) => ({
    ...b,
    label: new Date(b.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Productivity insights and performance metrics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Heatmap data={heatmapData || []} />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-400" />
            <h3 className="text-sm font-semibold">Weekly Velocity</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityFormatted}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8A7F75", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8A7F75", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="url(#velocityGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="velocityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8B6085" />
                    <stop offset="100%" stopColor="#6B2D68" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Burndown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              <h3 className="text-sm font-semibold">Project Burndown</h3>
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="input text-xs !py-1 !px-2 !w-auto !rounded-md"
            >
              {(summary?.projects || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownFormatted}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#8A7F75", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#8A7F75", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#A09589" }}
                />
                <defs>
                  <linearGradient
                    id="burndownFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7BAFC4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7BAFC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="remaining"
                  name="Remaining"
                  stroke="#7BAFC4"
                  fill="url(#burndownFill)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  name="Ideal"
                  stroke="#8B6085"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Project Comparison */}
      {summary?.projectStats && summary.projectStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4">
            Project Health Overview
          </h3>
          <div className="space-y-4">
            {summary.projectStats.map((project) => (
              <div key={project.projectId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>
                      {project.completed}/{project.total} done
                    </span>
                    {project.overdue > 0 && (
                      <span className="text-red-400">
                        {project.overdue} overdue
                      </span>
                    )}
                    <span
                      className="font-semibold"
                      style={{ color: project.color }}
                    >
                      {project.completionRate}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-glass overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${project.color}, ${project.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

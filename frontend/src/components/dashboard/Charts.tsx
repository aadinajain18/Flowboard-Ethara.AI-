import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

// ─── Status Donut Chart ─────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  TODO: "#A09589",
  IN_PROGRESS: "#6B9EC4",
  DONE: "#7CB87C",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

interface StatusChartProps {
  data: { status: string; count: number }[];
  total: number;
}

export function StatusChart({ data, total }: StatusChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
        Tasks by Status
      </h3>
      {hasData ? (
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#8B6085"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#302D2D",
                    border: "1px solid rgba(238,229,218,0.1)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#EEE5DA",
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    STATUS_LABELS[name] || name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-[10px] text-[var(--text-muted)]">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 flex-1">
            {data.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.status] }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No task data yet
        </div>
      )}
    </motion.div>
  );
}

// ─── Priority Bar Chart ─────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#7CB87C",
  MEDIUM: "#D4A84B",
  HIGH: "#C75050",
  URGENT: "#D45050",
};

interface PriorityChartProps {
  data: { priority: string; count: number }[];
}

export function PriorityChart({ data }: PriorityChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
        Tasks by Priority
      </h3>
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={16}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(238,229,218,0.04)"
                horizontal={false}
              />
              <XAxis type="number" stroke="#8A7F75" fontSize={12} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="priority"
                stroke="#8A7F75"
                fontSize={12}
                width={60}
                tickFormatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()}
              />
              <Tooltip
                contentStyle={{
                  background: "#302D2D",
                  border: "1px solid rgba(238,229,218,0.1)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#EEE5DA",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.priority}
                    fill={PRIORITY_COLORS[entry.priority] || "#8B6085"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No task data yet
        </div>
      )}
    </motion.div>
  );
}

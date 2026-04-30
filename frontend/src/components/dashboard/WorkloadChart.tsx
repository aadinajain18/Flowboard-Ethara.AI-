import { motion } from "framer-motion";
import { Avatar } from "../ui/Avatar";

interface WorkloadItem {
  user: { id: string; name: string; avatarColor: string };
  taskCount: number;
}

interface WorkloadChartProps {
  data: WorkloadItem[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  const max = Math.max(...data.map((d) => d.taskCount), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-5">
        Team Workload
      </h3>
      {data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No team data yet
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={item.user.id} className="flex items-center gap-3">
              <Avatar
                name={item.user.name}
                color={item.user.avatarColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium truncate">
                    {item.user.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-2 shrink-0">
                    {item.taskCount} tasks
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${item.user.avatarColor}, ${item.user.avatarColor}cc)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.taskCount / max) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

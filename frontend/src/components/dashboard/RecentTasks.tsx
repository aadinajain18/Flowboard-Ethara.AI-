import { motion } from "framer-motion";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import type { Task } from "../../types";

const priorityStyle: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  URGENT: "priority-urgent",
};

const statusStyle: Record<string, string> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-in-progress",
  DONE: "status-done",
};

const statusLabel: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

interface RecentTasksProps {
  tasks: Task[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-glass">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Recent Tasks
        </h3>
      </div>
      {tasks.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No tasks yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-glass text-xs uppercase text-[var(--text-muted)]">
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.04 }}
                  className={`border-b border-glass last:border-0 transition-colors hover:bg-glass-hover ${
                    task.overdue ? "bg-red-500/5" : ""
                  }`}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      {task.overdue && (
                        <AlertTriangle size={14} className="text-red-400 shrink-0" />
                      )}
                      <span className={`font-medium truncate max-w-[200px] ${task.overdue ? "text-red-300" : ""}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: task.project?.color || "#8B6085" }}
                      />
                      <span className="text-[var(--text-secondary)] truncate max-w-[120px]">
                        {task.project?.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={task.assignee.name}
                          color={task.assignee.avatarColor}
                          size="sm"
                        />
                        <span className="text-[var(--text-secondary)] text-xs truncate">
                          {task.assignee.name.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`chip text-[11px] ${priorityStyle[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                    {format(new Date(task.dueDate), "MMM d")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`chip text-[11px] ${statusStyle[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

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

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[var(--text-muted)]">
        No tasks match your filters
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-glass text-xs uppercase text-[var(--text-muted)]">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onTaskClick(task)}
                className={`border-b border-glass last:border-0 cursor-pointer transition-colors hover:bg-glass-hover ${
                  task.overdue ? "bg-red-500/5" : ""
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {task.overdue && (
                      <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    )}
                    <span className={`font-medium truncate max-w-[250px] ${task.overdue ? "text-red-300" : ""}`}>
                      {task.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={task.assignee.name}
                        color={task.assignee.avatarColor}
                        size="sm"
                      />
                      <span className="text-[var(--text-secondary)] text-xs">
                        {task.assignee.name}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`chip text-[11px] ${priorityStyle[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
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
    </div>
  );
}

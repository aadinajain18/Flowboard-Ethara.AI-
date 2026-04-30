import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  X,
  Trash2,
  Send,
  AlertTriangle,
  Calendar,
  Flag,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, unwrap } from "../../lib/api";
import { Avatar } from "../ui/Avatar";
import type { Task, ProjectMember } from "../../types";

const priorityColors: Record<string, string> = {
  LOW: "priority-low",
  MEDIUM: "priority-medium",
  HIGH: "priority-high",
  URGENT: "priority-urgent",
};

const statusColors: Record<string, string> = {
  TODO: "status-todo",
  IN_PROGRESS: "status-in-progress",
  DONE: "status-done",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

interface TaskDetailPanelProps {
  taskId: string | null;
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
}

export function TaskDetailPanel({
  taskId,
  projectId,
  members,
  onClose,
}: TaskDetailPanelProps) {
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => unwrap<Task>(api.get(`/api/tasks/${taskId}`)),
    enabled: !!taskId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Task>) =>
      unwrap(api.put(`/api/tasks/${taskId}`, data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => unwrap(api.delete(`/api/tasks/${taskId}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted");
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      unwrap(api.post(`/api/tasks/${taskId}/comments`, { content })),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success("Comment added");
    },
  });

  return (
    <AnimatePresence>
      {taskId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-glass overflow-y-auto"
            style={{ background: "var(--bg-raised)" }}
          >
            {isLoading || !task ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={24} className="animate-spin text-brand-400" />
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-glass shrink-0">
                  <h2 className="text-lg font-semibold truncate pr-4">
                    Task Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm("Delete this task?")) deleteMutation.mutate();
                      }}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-glass-hover hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold leading-tight">
                      {task.overdue && (
                        <AlertTriangle size={18} className="inline mr-2 text-red-400" />
                      )}
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Status
                      </label>
                      <select
                        className="input py-2 text-sm"
                        value={task.status}
                        onChange={(e) => updateMutation.mutate({ status: e.target.value as any })}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                        <Flag size={12} /> Priority
                      </label>
                      <select
                        className="input py-2 text-sm"
                        value={task.priority}
                        onChange={(e) => updateMutation.mutate({ priority: e.target.value as any })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    {/* Due date */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                        <Calendar size={12} /> Due Date
                      </label>
                      <input
                        type="date"
                        className="input py-2 text-sm"
                        value={new Date(task.dueDate).toISOString().split("T")[0]}
                        onChange={(e) => updateMutation.mutate({ dueDate: e.target.value })}
                      />
                    </div>

                    {/* Assignee */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                        <User size={12} /> Assignee
                      </label>
                      <select
                        className="input py-2 text-sm"
                        value={task.assigneeId}
                        onChange={(e) => updateMutation.mutate({ assigneeId: e.target.value })}
                      >
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.user?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">
                        Subtasks ({task.subtasks.filter((s) => s.status === "DONE").length}/{task.subtasks.length})
                      </h4>
                      <div className="space-y-2">
                        {task.subtasks.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-3 glass rounded-lg px-3 py-2"
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                sub.status === "DONE"
                                  ? "bg-green-500 border-green-500"
                                  : "border-[var(--text-muted)]"
                              }`}
                            >
                              {sub.status === "DONE" && (
                                <CheckCircle2 size={10} className="text-white" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                sub.status === "DONE"
                                  ? "line-through text-[var(--text-muted)]"
                                  : ""
                              }`}
                            >
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3">
                      Comments ({task.comments?.length || 0})
                    </h4>

                    {/* Comment list */}
                    <div className="space-y-3 mb-4">
                      {task.comments?.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <Avatar
                            name={c.user?.name || "?"}
                            color={c.user?.avatarColor}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {c.user?.name}
                              </span>
                              <span className="text-[11px] text-[var(--text-muted)]">
                                {format(new Date(c.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {(!task.comments || task.comments.length === 0) && (
                        <p className="text-xs text-[var(--text-muted)] py-2">
                          No comments yet
                        </p>
                      )}
                    </div>

                    {/* Add comment */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (comment.trim()) commentMutation.mutate(comment.trim());
                      }}
                      className="flex gap-2"
                    >
                      <input
                        className="input flex-1 py-2 text-sm"
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim() || commentMutation.isPending}
                        className="btn px-3"
                      >
                        {commentMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Meta info */}
                  <div className="text-xs text-[var(--text-muted)] space-y-1 pt-2 border-t border-glass">
                    <p>Created by {task.createdBy?.name} on {format(new Date(task.createdAt), "MMM d, yyyy")}</p>
                    <p>Last updated {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

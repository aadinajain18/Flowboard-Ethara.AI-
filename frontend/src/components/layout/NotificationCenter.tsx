import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  UserPlus,
  ListTodo,
  MessageSquare,
  X,
} from "lucide-react";
import { api, unwrap } from "../../lib/api";
import { useDynamicTab } from "../../hooks/useDynamicTab";
import type { Notification } from "../../types";

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  task_assigned: { icon: ListTodo, color: "#8B6085" },
  member_added: { icon: UserPlus, color: "#6B2D68" },
  comment: { icon: MessageSquare, color: "#7BAFC4" },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      unwrap<{ notifications: Notification[]; unreadCount: number }>(
        api.get("/api/notifications")
      ),
    refetchInterval: 30000, // poll every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      unwrap(api.patch(`/api/notifications/${id}/read`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => unwrap(api.patch("/api/notifications/read-all")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Update browser tab title + favicon badge
  useDynamicTab(unreadCount);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-glass-hover hover:text-[var(--text-primary)]"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: 'var(--brand)', color: 'var(--bg-base)' }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] rounded-xl border border-glass overflow-hidden"
            style={{ background: "var(--bg-overlay)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-glass">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-brand-400 hover:bg-brand-500/10 transition-colors"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:bg-glass-hover transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Bell size={28} className="text-[var(--text-muted)] mb-3" />
                  </motion.div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    All caught up!
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">
                    No new notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification, i) => {
                  const config =
                    typeConfig[notification.type] || typeConfig.task_assigned;
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex gap-3 px-4 py-3 border-b border-glass transition-colors hover:bg-glass-hover cursor-pointer ${
                        !notification.read ? "bg-brand-500/[0.03]" : ""
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon size={14} style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {notification.title}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notification.read && (
                        <div className="flex items-start pt-2">
                          <div className="h-2 w-2 rounded-full bg-brand-500" />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

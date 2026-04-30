import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  ArrowRight,
  Trash2,
  UserPlus,
  UserMinus,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import type { Activity, ActivityAction } from "../../types";

const actionConfig: Record<
  ActivityAction,
  { icon: typeof Plus; color: string; verb: string }
> = {
  CREATED: { icon: Plus, color: "#7CB87C", verb: "created" },
  UPDATED: { icon: RefreshCw, color: "#6B9EC4", verb: "updated" },
  DELETED: { icon: Trash2, color: "#C75050", verb: "deleted" },
  STATUS_CHANGED: { icon: ArrowRight, color: "#D4A84B", verb: "moved" },
  MEMBER_ADDED: { icon: UserPlus, color: "#6B2D68", verb: "added" },
  MEMBER_REMOVED: { icon: UserMinus, color: "#D45050", verb: "removed" },
  ASSIGNED: { icon: UserPlus, color: "#8B6085", verb: "assigned" },
  COMMENTED: { icon: MessageSquare, color: "#7BAFC4", verb: "commented on" },
};

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-5">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No activity yet
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, i) => {
            const config = actionConfig[activity.action] || actionConfig.UPDATED;
            const ActionIcon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex gap-3 py-3 group"
              >
                {/* Timeline dot */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${config.color}18` }}
                  >
                    <ActionIcon size={13} style={{ color: config.color }} />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="w-px flex-1 bg-glass mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">
                      {activity.user?.name || "Someone"}
                    </span>{" "}
                    <span className="text-[var(--text-secondary)]">
                      {config.verb}
                    </span>{" "}
                    <span className="font-medium text-brand-300">
                      {activity.entityTitle}
                    </span>
                    {activity.details && (
                      <span className="text-[var(--text-muted)]">
                        {" "}— {activity.details}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {activity.project && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-glass text-[var(--text-muted)]">
                        {activity.project.name}
                      </span>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

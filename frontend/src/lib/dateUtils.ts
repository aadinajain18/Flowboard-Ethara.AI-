import {
  differenceInDays,
  differenceInHours,
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
} from "date-fns";

/**
 * Returns smart human-readable labels like:
 * "Due today", "Due tomorrow", "3 days overdue", "in 5 days"
 */
export function smartDueDate(dateStr: string | Date): {
  label: string;
  isOverdue: boolean;
  urgency: "overdue" | "today" | "soon" | "normal";
} {
  const date = new Date(dateStr);
  const now = new Date();
  const daysUntil = differenceInDays(date, now);
  const hoursUntil = differenceInHours(date, now);

  if (isToday(date)) {
    return {
      label: `Due today`,
      isOverdue: false,
      urgency: "today",
    };
  }

  if (isTomorrow(date)) {
    return {
      label: "Due tomorrow",
      isOverdue: false,
      urgency: "soon",
    };
  }

  if (isYesterday(date)) {
    return {
      label: "1 day overdue",
      isOverdue: true,
      urgency: "overdue",
    };
  }

  if (isPast(date)) {
    const daysOverdue = Math.abs(daysUntil);
    return {
      label: `${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue`,
      isOverdue: true,
      urgency: "overdue",
    };
  }

  if (daysUntil <= 3) {
    return {
      label: `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`,
      isOverdue: false,
      urgency: "soon",
    };
  }

  return {
    label: format(date, "MMM d"),
    isOverdue: false,
    urgency: "normal",
  };
}

/**
 * Color for urgency level
 */
export function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "overdue":
      return "#C75050";
    case "today":
      return "#D4A84B";
    case "soon":
      return "#6B9EC4";
    default:
      return "var(--text-muted)";
  }
}

/**
 * Natural Language Task Parser
 *
 * Parses human-readable strings like:
 *   "Review marketing designs tomorrow high priority"
 *   "Fix login bug today urgent"
 *   "Write docs by friday medium"
 *
 * and extracts: { title, dueDate, priority }
 */

import { addDays, nextMonday, nextFriday, setDay } from "date-fns";

interface ParsedTask {
  title: string;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null;
}

// ── Priority patterns ────────────────────────────────────
const PRIORITY_PATTERNS: { pattern: RegExp; priority: ParsedTask["priority"] }[] = [
  { pattern: /\b(urgent|p0|critical|asap)\b/i, priority: "URGENT" },
  { pattern: /\b(high\s*(?:priority)?|p1|important)\b/i, priority: "HIGH" },
  { pattern: /\b(medium\s*(?:priority)?|p2|moderate|normal)\b/i, priority: "MEDIUM" },
  { pattern: /\b(low\s*(?:priority)?|p3|minor)\b/i, priority: "LOW" },
];

// ── Date patterns ────────────────────────────────────────
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function parseRelativeDate(text: string): { date: Date | null; matched: string } {
  const lower = text.toLowerCase();

  // "today"
  if (/\btoday\b/.test(lower)) {
    return { date: new Date(), matched: "today" };
  }

  // "tomorrow"
  if (/\btomorrow\b/.test(lower)) {
    return { date: addDays(new Date(), 1), matched: "tomorrow" };
  }

  // "next week"
  if (/\bnext\s*week\b/.test(lower)) {
    return { date: nextMonday(new Date()), matched: lower.match(/next\s*week/)![0] };
  }

  // "in X days"
  const inDaysMatch = lower.match(/\bin\s*(\d+)\s*days?\b/);
  if (inDaysMatch) {
    return {
      date: addDays(new Date(), parseInt(inDaysMatch[1])),
      matched: inDaysMatch[0],
    };
  }

  // "by <day name>" or "on <day name>" or just the day name
  for (let i = 0; i < DAY_NAMES.length; i++) {
    const dayPattern = new RegExp(`\\b(?:by|on|next)?\\s*${DAY_NAMES[i]}\\b`, "i");
    const dayMatch = lower.match(dayPattern);
    if (dayMatch) {
      // Get the next occurrence of that day
      const today = new Date();
      const targetDay = i; // 0=Sun, 1=Mon, ...
      let daysUntil = targetDay - today.getDay();
      if (daysUntil <= 0) daysUntil += 7;
      return {
        date: addDays(today, daysUntil),
        matched: dayMatch[0],
      };
    }
  }

  // "MM/DD" or "M/D" format
  const dateMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = new Date().getFullYear();
    const date = new Date(year, month, day);
    if (date < new Date()) date.setFullYear(year + 1);
    return { date, matched: dateMatch[0] };
  }

  return { date: null, matched: "" };
}

export function parseNaturalLanguageTask(input: string): ParsedTask {
  let remaining = input.trim();
  let priority: ParsedTask["priority"] = null;
  let dueDate: Date | null = null;

  // Extract priority
  for (const pp of PRIORITY_PATTERNS) {
    const match = remaining.match(pp.pattern);
    if (match) {
      priority = pp.priority;
      remaining = remaining.replace(match[0], "").trim();
      break;
    }
  }

  // Extract date
  const dateResult = parseRelativeDate(remaining);
  if (dateResult.date) {
    dueDate = dateResult.date;
    remaining = remaining.replace(dateResult.matched, "").trim();
  }

  // Clean up the remaining title
  let title = remaining
    .replace(/\s+/g, " ")  // collapse whitespace
    .replace(/^[,\-–—\s]+/, "") // trim leading punctuation
    .replace(/[,\-–—\s]+$/, "") // trim trailing punctuation
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return { title, dueDate, priority };
}

/**
 * Generates a preview string for the parsed result
 */
export function formatParsedPreview(parsed: ParsedTask): string {
  const parts: string[] = [];
  if (parsed.title) parts.push(`"${parsed.title}"`);
  if (parsed.dueDate) {
    parts.push(`due ${parsed.dueDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`);
  }
  if (parsed.priority) {
    parts.push(`${parsed.priority.toLowerCase()} priority`);
  }
  return parts.join(" · ");
}

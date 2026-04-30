import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, Flag, X, Sparkles } from "lucide-react";
import { parseNaturalLanguageTask, formatParsedPreview } from "../../lib/nlParser";
import { playSound } from "../../lib/sounds";

interface QuickAddBarProps {
  onSubmit: (data: { title: string; dueDate?: string; priority?: string }) => void;
  projectId: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#7CB87C",
  MEDIUM: "#D4A84B",
  HIGH: "#C75050",
  URGENT: "#D45050",
};

export function QuickAddBar({ onSubmit, projectId }: QuickAddBarProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseNaturalLanguageTask(input), [input]);
  const preview = useMemo(() => formatParsedPreview(parsed), [parsed]);
  const hasContent = input.trim().length > 0;

  const handleSubmit = () => {
    if (!parsed.title) return;

    playSound("success");

    onSubmit({
      title: parsed.title,
      dueDate: parsed.dueDate ? parsed.dueDate.toISOString() : undefined,
      priority: parsed.priority || undefined,
    });

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasContent) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setInput("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      {/* Main Input */}
      <div
        className={`flex items-center gap-2 rounded-xl border transition-all duration-200 ${
          focused
            ? "border-brand-500/50 bg-brand-500/[0.03] shadow-[0_0_20px_rgba(99,102,241,0.08)]"
            : "border-glass bg-white/[0.02] hover:border-glass-hover"
        }`}
      >
        <div className="flex items-center gap-2 px-3.5 py-2.5 flex-1 min-w-0">
          <Sparkles
            size={16}
            className={`shrink-0 transition-colors ${
              focused ? "text-brand-400" : "text-[var(--text-muted)]"
            }`}
          />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder='Try: "Review designs tomorrow high priority"'
            className="flex-1 bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {hasContent && (
            <button
              onClick={() => setInput("")}
              className="shrink-0 rounded-md p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {hasContent && (
          <button
            onClick={handleSubmit}
            className="btn !py-1.5 !px-3 !text-xs !rounded-lg mr-1.5 shrink-0"
          >
            <Zap size={12} />
            Add
          </button>
        )}
      </div>

      {/* AI Preview */}
      <AnimatePresence>
        {hasContent && (focused || input.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1.5 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-brand-500/[0.04] border border-brand-500/10">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 shrink-0">
                Parsed
              </span>
              <div className="flex items-center gap-2.5 flex-1 min-w-0 text-xs text-[var(--text-secondary)]">
                {parsed.title && (
                  <span className="truncate font-medium">
                    {parsed.title}
                  </span>
                )}
                {parsed.dueDate && (
                  <span className="flex items-center gap-1 shrink-0 text-blue-400">
                    <Calendar size={10} />
                    {parsed.dueDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {parsed.priority && (
                  <span
                    className="flex items-center gap-1 shrink-0 font-medium"
                    style={{ color: PRIORITY_COLORS[parsed.priority] }}
                  >
                    <Flag size={10} />
                    {parsed.priority}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

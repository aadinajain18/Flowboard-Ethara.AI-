import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  BarChart3,
  ArrowRight,
  Hash,
  Keyboard,
  Command,
} from "lucide-react";
import { api, unwrap } from "../../lib/api";
import { playSound } from "../../lib/sounds";
import { SHORTCUT_REFERENCE } from "../../hooks/useKeyboardShortcuts";
import type { Project, Task } from "../../types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  type: "action" | "project" | "task" | "shortcut";
  title: string;
  subtitle?: string;
  icon: typeof Search;
  iconColor?: string;
  onSelect: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<"search" | "shortcuts">("search");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch projects + tasks for search
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => unwrap<Project[]>(api.get("/api/projects")),
    enabled: open,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    enabled: open,
  });

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setMode("search");
      playSound("pop");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const go = useCallback(
    (path: string) => {
      onClose();
      navigate(path);
    },
    [navigate, onClose]
  );

  // Build command items
  const items = useMemo<CommandItem[]>(() => {
    if (mode === "shortcuts") {
      return SHORTCUT_REFERENCE.map((s, i) => ({
        id: `shortcut-${i}`,
        type: "shortcut" as const,
        title: s.description,
        subtitle: s.keys.join(" + "),
        icon: Keyboard,
        onSelect: () => {},
      }));
    }

    const q = query.toLowerCase().trim();
    const results: CommandItem[] = [];

    // Quick actions (always shown at top when no query)
    const actions: CommandItem[] = [
      {
        id: "nav-dashboard",
        type: "action",
        title: "Go to Dashboard",
        subtitle: "View analytics and overview",
        icon: LayoutDashboard,
        iconColor: "#8B6085",
        onSelect: () => go("/dashboard"),
      },
      {
        id: "nav-projects",
        type: "action",
        title: "Go to Projects",
        subtitle: "Browse all projects",
        icon: FolderKanban,
        iconColor: "#6B2D68",
        onSelect: () => go("/projects"),
      },
      {
        id: "nav-analytics",
        type: "action",
        title: "Go to Analytics",
        subtitle: "Productivity insights",
        icon: BarChart3,
        iconColor: "#7BAFC4",
        onSelect: () => go("/analytics"),
      },
      {
        id: "show-shortcuts",
        type: "action",
        title: "Keyboard Shortcuts",
        subtitle: "View all keyboard shortcuts",
        icon: Keyboard,
        iconColor: "#D4A84B",
        onSelect: () => setMode("shortcuts"),
      },
    ];

    // Project items
    const projectItems: CommandItem[] = (projects || []).map((p) => ({
      id: `project-${p.id}`,
      type: "project" as const,
      title: p.name,
      subtitle: p.description,
      icon: FolderKanban,
      iconColor: p.color,
      onSelect: () => go(`/projects/${p.id}`),
    }));

    if (!q) {
      // Show actions + projects when no search query
      results.push(...actions, ...projectItems);
    } else {
      // Filter everything by query
      const filtered = [...actions, ...projectItems].filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q)
      );
      results.push(...filtered);
    }

    return results;
  }, [query, projects, mode, go]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [items.length, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && items[activeIndex]) {
        e.preventDefault();
        items[activeIndex].onSelect();
      } else if (e.key === "Escape") {
        if (mode === "shortcuts") {
          setMode("search");
        } else {
          onClose();
        }
      } else if (e.key === "Backspace" && !query && mode === "shortcuts") {
        setMode("search");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, activeIndex, items, query, mode, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Group items by type for section headers
  const grouped = useMemo(() => {
    const groups: { label: string; items: (CommandItem & { globalIndex: number })[] }[] = [];
    let globalIndex = 0;

    if (mode === "shortcuts") {
      groups.push({
        label: "Keyboard Shortcuts",
        items: items.map((item, i) => ({ ...item, globalIndex: i })),
      });
      return groups;
    }

    const actions = items.filter((i) => i.type === "action");
    const projectItems = items.filter((i) => i.type === "project");
    const taskItems = items.filter((i) => i.type === "task");

    if (actions.length > 0) {
      groups.push({
        label: query ? "Results" : "Quick Actions",
        items: actions.map((item) => ({ ...item, globalIndex: globalIndex++ })),
      });
    }
    if (projectItems.length > 0) {
      groups.push({
        label: "Projects",
        items: projectItems.map((item) => ({ ...item, globalIndex: globalIndex++ })),
      });
    }
    if (taskItems.length > 0) {
      groups.push({
        label: "Tasks",
        items: taskItems.map((item) => ({ ...item, globalIndex: globalIndex++ })),
      });
    }

    return groups;
  }, [items, query, mode]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl rounded-xl border border-glass overflow-hidden shadow-2xl"
            style={{ background: "var(--bg-overlay)" }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-glass">
              <Search size={18} className="text-[var(--text-muted)] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "shortcuts"
                    ? "Keyboard shortcuts..."
                    : "Search projects, tasks, and actions..."
                }
                className="flex-1 bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 rounded-md border border-glass bg-glass px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="overflow-y-auto max-h-[340px] py-2"
            >
              {grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search size={28} className="text-[var(--text-muted)] mb-2" />
                  <p className="text-sm text-[var(--text-muted)]">
                    No results for "{query}"
                  </p>
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.label}>
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        {group.label}
                      </span>
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        data-index={item.globalIndex}
                        onClick={() => item.onSelect()}
                        onMouseEnter={() => setActiveIndex(item.globalIndex)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIndex === item.globalIndex
                            ? "bg-brand-500/10 text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)] hover:bg-glass-hover"
                        }`}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: item.iconColor
                              ? `${item.iconColor}15`
                              : "rgba(255,255,255,0.05)",
                          }}
                        >
                          <item.icon
                            size={16}
                            style={{ color: item.iconColor || "var(--text-muted)" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-[var(--text-muted)] truncate">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.type === "shortcut" ? (
                          <div className="flex items-center gap-1">
                            {item.subtitle?.split(" + ").map((k, i) => (
                              <kbd
                                key={i}
                                className="rounded border border-glass bg-glass px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        ) : (
                          activeIndex === item.globalIndex && (
                            <ArrowRight
                              size={14}
                              className="shrink-0 text-brand-400"
                            />
                          )
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-glass text-[10px] text-[var(--text-muted)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-glass bg-glass px-1 py-0.5 font-medium">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-glass bg-glass px-1 py-0.5 font-medium">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-glass bg-glass px-1 py-0.5 font-medium">Esc</kbd>
                  Close
                </span>
              </div>
              <span className="flex items-center gap-1 opacity-60">
                <Command size={10} />
                FlowBoard
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

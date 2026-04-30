import { Search, Command } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "../ui/ThemeToggle";

interface TopBarProps {
  onOpenPalette?: () => void;
}

export function TopBar({ onOpenPalette }: TopBarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-glass bg-surface-raised/40 backdrop-blur-2xl px-6">
      {/* Search Trigger (⌘K) */}
      <button
        onClick={onOpenPalette}
        className="group flex items-center gap-3 rounded-lg border border-glass px-4 py-2 text-sm text-[var(--text-muted)] transition-all hover:border-[var(--border-hover)] hover:bg-glass-hover"
        aria-label="Open command palette"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search projects, tasks...</span>
        <kbd className="ml-auto hidden rounded-md border border-glass bg-glass px-1.5 py-0.5 text-xs font-medium text-[var(--text-muted)] sm:inline-flex items-center gap-1">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notification Center */}
        <NotificationCenter />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-glass"
            style={{ backgroundColor: user?.avatarColor || "var(--brand)" }}
          >
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="hidden text-sm font-medium md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}

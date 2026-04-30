import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutMap {
  [key: string]: {
    handler: () => void;
    description: string;
    category: string;
  };
}

export function useKeyboardShortcuts(
  onOpenPalette: () => void,
  shortcuts?: ShortcutMap
) {
  const navigate = useNavigate();

  const defaultShortcuts: ShortcutMap = {
    "g+d": {
      handler: () => navigate("/dashboard"),
      description: "Go to Dashboard",
      category: "Navigation",
    },
    "g+p": {
      handler: () => navigate("/projects"),
      description: "Go to Projects",
      category: "Navigation",
    },
    "g+a": {
      handler: () => navigate("/analytics"),
      description: "Go to Analytics",
      category: "Navigation",
    },
  };

  const allShortcuts = { ...defaultShortcuts, ...shortcuts };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // But still allow ⌘K / Ctrl+K even in inputs
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          onOpenPalette();
        }
        return;
      }

      // ⌘K / Ctrl+K — Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenPalette();
        return;
      }

      // "?" — Show shortcut help (handled via palette)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onOpenPalette();
        return;
      }

      // Escape is handled by individual components
    },
    [onOpenPalette]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts: allShortcuts };
}

export const SHORTCUT_REFERENCE = [
  { keys: ["⌘", "K"], description: "Open command palette", category: "General" },
  { keys: ["?"], description: "Open command palette", category: "General" },
  { keys: ["G", "D"], description: "Go to Dashboard", category: "Navigation" },
  { keys: ["G", "P"], description: "Go to Projects", category: "Navigation" },
  { keys: ["G", "A"], description: "Go to Analytics", category: "Navigation" },
  { keys: ["Esc"], description: "Close panel / modal", category: "General" },
];

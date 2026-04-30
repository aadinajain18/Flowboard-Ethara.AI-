import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("flowboard_theme") as Theme | null;
  if (stored) return stored;
  // Detect system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem("flowboard_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));

// Initialize theme on load
const theme = getInitialTheme();
document.documentElement.setAttribute("data-theme", theme);

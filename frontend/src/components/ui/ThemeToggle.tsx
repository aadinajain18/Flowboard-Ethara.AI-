import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/theme";
import { playSound } from "../../lib/sounds";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => { toggleTheme(); playSound("toggle"); }}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-glass-hover hover:text-[var(--text-primary)]"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ position: "absolute" }}
      >
        <Moon size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? -180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ position: "absolute" }}
      >
        <Sun size={18} />
      </motion.div>
    </button>
  );
}

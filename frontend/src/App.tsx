import { useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/layout/PageTransition";
import { Toaster } from "react-hot-toast";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CommandPalette } from "./components/ui/CommandPalette";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Analytics } from "./pages/Analytics";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { useThemeStore } from "./store/theme";

function AppRoutes() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useKeyboardShortcuts(() => setPaletteOpen(true));

  const location = useLocation();

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <OnboardingTour />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/projects/:id" element={<PageTransition><ProjectDetail /></PageTransition>} />
              <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export function App() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#302D2D" : "#FAF5EF",
            color: isDark ? "#EEE5DA" : "#2D1B2E",
            border: `1px solid ${isDark ? "rgba(238,229,218,0.1)" : "rgba(74,25,66,0.1)"}`,
            fontSize: "14px",
            fontFamily: '"DM Sans", system-ui, sans-serif',
          },
          success: {
            iconTheme: { primary: "#7CB87C", secondary: isDark ? "#EEE5DA" : "#fff" },
          },
          error: {
            iconTheme: { primary: "#C75050", secondary: "#fff" },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Search,
  Bell,
  GripVertical,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

const TOUR_KEY = "flowboard_tour_complete";

interface TourStep {
  title: string;
  description: string;
  icon: typeof Zap;
  iconColor: string;
}

const steps: TourStep[] = [
  {
    title: "Welcome to FlowBoard! 🚀",
    description:
      "Your high-performance project management platform. Let's take a quick tour of the key features.",
    icon: Zap,
    iconColor: "#8B6085",
  },
  {
    title: "Dashboard Overview",
    description:
      "Get a bird's-eye view of all your tasks with status charts, priority breakdowns, team workload, and recent activity — all in one place.",
    icon: LayoutDashboard,
    iconColor: "#8B6085",
  },
  {
    title: "Drag & Drop Kanban",
    description:
      "Organize tasks visually with our Kanban board. Drag cards between columns to instantly update status. Smart due-date labels keep you on track.",
    icon: GripVertical,
    iconColor: "#6B2D68",
  },
  {
    title: "Project Management",
    description:
      "Create projects, invite team members, assign roles, and track progress. Each project has its own Board, List, Team, Activity, and Settings views.",
    icon: FolderKanban,
    iconColor: "#7CB87C",
  },
  {
    title: "Command Palette (⌘K)",
    description:
      "Press ⌘K or Ctrl+K anywhere to instantly search projects, tasks, and navigate — just like Linear, Notion, or VS Code.",
    icon: Search,
    iconColor: "#D4A84B",
  },
  {
    title: "Productivity Analytics",
    description:
      "Track your productivity with GitHub-style heatmaps, weekly velocity charts, project burndown graphs, and team performance metrics.",
    icon: BarChart3,
    iconColor: "#7BAFC4",
  },
  {
    title: "Real-Time Notifications",
    description:
      "Stay updated with the notification center. Get alerts when tasks are assigned, comments are posted, or team changes occur.",
    icon: Bell,
    iconColor: "#C75050",
  },
];

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const complete = localStorage.getItem(TOUR_KEY);
    if (!complete) {
      // Delay showing tour to let the page load
      const timer = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    setActive(false);
  }, []);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl border border-glass overflow-hidden shadow-2xl"
            style={{ background: "var(--bg-overlay)" }}
          >
            {/* Close button */}
            <button
              onClick={handleComplete}
              className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--text-muted)] hover:bg-glass-hover hover:text-[var(--text-primary)] transition-colors z-10"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Animated icon */}
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${step.iconColor}15` }}
              >
                <Icon size={32} style={{ color: step.iconColor }} />
              </motion.div>

              <motion.div
                key={`text-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-bold mb-2">{step.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-glass">
              {/* Step indicators */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-6 bg-brand-500"
                        : i < currentStep
                        ? "w-1.5 bg-brand-500/40"
                        : "w-1.5 bg-glass"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="btn-ghost !py-1.5 !px-3 !text-xs"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="btn !py-1.5 !px-4 !text-xs"
                >
                  {isLast ? "Get Started" : "Next"}
                  {!isLast && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

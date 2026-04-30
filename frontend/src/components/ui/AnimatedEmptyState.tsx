import { motion } from "framer-motion";

interface AnimatedEmptyStateProps {
  title: string;
  description: string;
  variant?: "tasks" | "notifications" | "projects" | "generic";
  action?: React.ReactNode;
}

function FloatingShapes({ variant }: { variant: string }) {
  const shapes = {
    tasks: [
      { size: 40, color: "rgba(99,102,241,0.15)", x: -30, delay: 0 },
      { size: 28, color: "rgba(139,92,246,0.12)", x: 25, delay: 0.3 },
      { size: 22, color: "rgba(34,197,94,0.12)", x: -15, delay: 0.6 },
      { size: 34, color: "rgba(59,130,246,0.1)", x: 35, delay: 0.9 },
    ],
    notifications: [
      { size: 36, color: "rgba(239,68,68,0.12)", x: -25, delay: 0 },
      { size: 24, color: "rgba(245,158,11,0.12)", x: 30, delay: 0.4 },
      { size: 30, color: "rgba(99,102,241,0.1)", x: -10, delay: 0.7 },
    ],
    projects: [
      { size: 44, color: "rgba(99,102,241,0.15)", x: -35, delay: 0 },
      { size: 32, color: "rgba(34,197,94,0.12)", x: 30, delay: 0.3 },
      { size: 26, color: "rgba(139,92,246,0.1)", x: -5, delay: 0.5 },
      { size: 20, color: "rgba(6,182,212,0.12)", x: 20, delay: 0.8 },
    ],
    generic: [
      { size: 36, color: "rgba(99,102,241,0.12)", x: -20, delay: 0 },
      { size: 28, color: "rgba(139,92,246,0.1)", x: 20, delay: 0.3 },
    ],
  };

  const items = shapes[variant as keyof typeof shapes] || shapes.generic;

  return (
    <div className="relative h-24 w-24 mx-auto mb-4">
      {items.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl"
          style={{
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            left: `calc(50% + ${shape.x}px - ${shape.size / 2}px)`,
          }}
          initial={{ opacity: 0, y: 20, rotate: -10 }}
          animate={{
            opacity: 1,
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            opacity: { duration: 0.4, delay: shape.delay },
            y: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: shape.delay,
            },
            rotate: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: shape.delay,
            },
          }}
        />
      ))}

      {/* Central icon circle */}
      <motion.div
        className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(99,102,241,0.08)" }}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.2 }}
      >
        {variant === "tasks" && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B6085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        )}
        {variant === "notifications" && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B6085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        )}
        {variant === "projects" && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B6085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
        )}
        {variant === "generic" && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B6085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15h8M9 9h.01M15 9h.01" />
          </svg>
        )}
      </motion.div>
    </div>
  );
}

export function AnimatedEmptyState({
  title,
  description,
  variant = "generic",
  action,
}: AnimatedEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <FloatingShapes variant={variant} />

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-base font-semibold mb-1.5"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

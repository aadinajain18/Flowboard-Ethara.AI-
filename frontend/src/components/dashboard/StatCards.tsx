import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  gradient: string;
  index: number;
}

export function StatCard({ label, value, icon: Icon, color, gradient, index }: StatCardProps) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [mv, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="glass glass-hover rounded-xl p-5 relative overflow-hidden group"
    >
      {/* Subtle gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${color}10 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon with gradient bg */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
          style={{ background: gradient }}
        >
          <Icon size={20} className="text-white" />
        </div>

        {/* Animated counter */}
        <motion.p className="text-3xl font-bold tracking-tight">{rounded}</motion.p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
      </div>
    </motion.div>
  );
}

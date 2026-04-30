import { motion } from "framer-motion";
import { CheckCircle2, Zap, Users, BarChart3, Kanban } from "lucide-react";

const floatingCards = [
  {
    title: "Design Sprint",
    status: "In Progress",
    statusColor: "#6B9EC4",
    assignee: "AK",
    assigneeColor: "#8B6085",
    priority: "High",
    priorityColor: "#C75050",
    x: "8%",
    y: "18%",
    rotate: -4,
    delay: 0,
  },
  {
    title: "API Integration",
    status: "Done",
    statusColor: "#7CB87C",
    assignee: "JL",
    assigneeColor: "#6B2D68",
    priority: "Medium",
    priorityColor: "#D4A84B",
    x: "55%",
    y: "12%",
    rotate: 3,
    delay: 0.3,
  },
  {
    title: "User Testing",
    status: "Todo",
    statusColor: "#A09589",
    assignee: "SR",
    assigneeColor: "#B86085",
    priority: "Urgent",
    priorityColor: "#D45050",
    x: "15%",
    y: "58%",
    rotate: 2,
    delay: 0.6,
  },
  {
    title: "Deploy v2.0",
    status: "In Progress",
    statusColor: "#6B9EC4",
    assignee: "CK",
    assigneeColor: "#7CB87C",
    priority: "High",
    priorityColor: "#C75050",
    x: "50%",
    y: "55%",
    rotate: -2,
    delay: 0.9,
  },
];

const features = [
  { icon: Kanban, text: "Kanban Boards" },
  { icon: Users, text: "Team Collaboration" },
  { icon: BarChart3, text: "Real-time Analytics" },
  { icon: CheckCircle2, text: "Activity Tracking" },
];

export function AuthBranding() {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-surface-raised p-10 xl:p-14">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 dot-pattern opacity-40" />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(201,168,124,0.1) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,96,133,0.08) 0%, transparent 70%)",
          bottom: "10%",
          right: "10%",
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo and tagline */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-glow" style={{ background: 'var(--brand)' }}>
            <Zap size={20} style={{ color: 'var(--bg-base)' }} />
          </div>
          <span className="text-2xl font-serif font-bold" style={{ color: 'var(--brand)' }}>
            FlowBoard
          </span>
        </div>
        <p className="mt-4 text-lg text-[var(--text-secondary)] max-w-md leading-relaxed">
          The modern way to manage projects, track tasks, and collaborate with your team — all in one beautiful workspace.
        </p>
      </div>

      {/* Floating task cards */}
      <div className="relative z-10 flex-1 my-8">
        <div className="relative w-full h-full min-h-[300px]">
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              className="absolute glass rounded-xl p-4 w-[220px] select-none"
              style={{ left: card.x, top: card.y }}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0],
                rotate: card.rotate,
              }}
              transition={{
                opacity: { delay: card.delay + 0.5, duration: 0.6 },
                y: {
                  delay: card.delay + 0.8,
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: { delay: card.delay + 0.5, duration: 0.6 },
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: card.statusColor,
                    backgroundColor: `${card.statusColor}18`,
                  }}
                >
                  {card.status}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: card.priorityColor,
                    backgroundColor: `${card.priorityColor}18`,
                  }}
                >
                  {card.priority}
                </span>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {card.title}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ backgroundColor: card.assigneeColor }}
                >
                  {card.assignee}
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: card.statusColor }}
                    initial={{ width: "0%" }}
                    animate={{
                      width: card.status === "Done" ? "100%" : card.status === "In Progress" ? "60%" : "15%",
                    }}
                    transition={{ delay: card.delay + 1, duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div className="relative z-10">
        <div className="flex flex-wrap gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.15 }}
              className="flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)]"
            >
              <feature.icon size={14} className="text-brand-400" />
              {feature.text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { FolderKanban, MoreHorizontal, Users, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { AvatarStack } from "../ui/Avatar";
import type { Project } from "../../types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const totalTasks = project._count?.tasks || 0;
  const totalMembers = project._count?.members || 0;
  const members = project.members?.map((m) => ({
    name: m.user?.name || "?",
    avatarColor: m.user?.avatarColor,
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link
        to={`/projects/${project.id}`}
        className="block glass glass-hover rounded-xl overflow-hidden group transition-all duration-300"
      >
        {/* Colored header bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}99)` }}
        />

        <div className="p-5">
          {/* Icon + Title Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${project.color}18` }}
              >
                <FolderKanban size={20} style={{ color: project.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-brand-300 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {project.status === "ARCHIVED" ? "Archived" : "Active"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 min-h-[40px]">
            {project.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-glass">
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <ListTodo size={13} />
                {totalTasks} tasks
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {totalMembers}
              </span>
            </div>
            {members.length > 0 && (
              <AvatarStack users={members} max={3} size="sm" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

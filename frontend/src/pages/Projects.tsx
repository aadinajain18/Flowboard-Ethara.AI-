import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FolderPlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { api, unwrap } from "../lib/api";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectForm } from "../components/projects/ProjectForm";
import { Modal } from "../components/ui/Modal";
import { SkeletonCards } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import type { Project } from "../types";

export function Projects() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => unwrap<Project[]>(api.get("/api/projects")),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => unwrap(api.post("/api/projects", data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      toast.success("Project created!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create project");
    },
  });

  const filtered = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage and organize your team's work
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn">
          <FolderPlus size={16} />
          New Project
        </button>
      </div>

      {/* Search */}
      {projects && projects.length > 0 && (
        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            className="input pl-10"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Project Grid */}
      {isLoading ? (
        <SkeletonCards count={6} />
      ) : !filtered || filtered.length === 0 ? (
        search ? (
          <EmptyState
            title="No results"
            text={`No projects match "${search}"`}
          />
        ) : (
          <EmptyState
            title="No projects yet"
            text="Create your first project to get started with task management."
            action={
              <button onClick={() => setShowCreate(true)} className="btn">
                <FolderPlus size={16} />
                Create Project
              </button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
        />
      </Modal>
    </div>
  );
}

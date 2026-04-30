import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Kanban,
  List,
  Users,
  Activity,
  Settings,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  FolderKanban,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, unwrap } from "../lib/api";
import { useAuthStore } from "../store/auth";
import { Modal } from "../components/ui/Modal";
import { Avatar } from "../components/ui/Avatar";
import { SkeletonRows } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ProjectForm } from "../components/projects/ProjectForm";
import { AddMemberModalContent } from "../components/projects/AddMemberModal";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { TaskDetailPanel } from "../components/tasks/TaskDetailPanel";
import { TaskForm } from "../components/tasks/TaskForm";
import { TaskFilters } from "../components/tasks/TaskFilters";
import { TaskListView } from "../components/tasks/TaskListView";
import { QuickAddBar } from "../components/tasks/QuickAddBar";
import type { Project, Task, TaskStatus, Activity as ActivityType } from "../types";

type Tab = "board" | "list" | "team" | "activity" | "settings";

const tabs: { id: Tab; label: string; icon: typeof Kanban }[] = [
  { id: "board", label: "Board", icon: Kanban },
  { id: "list", label: "List", icon: List },
  { id: "team", label: "Team", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>("TODO");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => unwrap<Project>(api.get(`/api/projects/${id}`)),
    enabled: !!id,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", id, filterStatus, filterPriority, filterAssignee, filterSearch],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      if (filterAssignee) params.set("assigneeId", filterAssignee);
      if (filterSearch) params.set("search", filterSearch);
      return unwrap<Task[]>(api.get(`/api/tasks/project/${id}?${params}`));
    },
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ["activities", id],
    queryFn: () =>
      unwrap<{ activities: ActivityType[] }>(api.get(`/api/activities/project/${id}`)),
    enabled: !!id && activeTab === "activity",
  });

  const deleteMutation = useMutation({
    mutationFn: () => unwrap(api.delete(`/api/projects/${id}`)),
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => unwrap(api.put(`/api/projects/${id}`, data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      unwrap(api.delete(`/api/projects/${id}/members/${userId}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Member removed");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => unwrap(api.post(`/api/tasks/project/${id}`, data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowCreateTask(false);
      toast.success("Task created");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      unwrap(api.patch(`/api/tasks/${taskId}/status`, { status })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64 rounded-lg" />
        <SkeletonRows rows={5} />
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        text="This project may have been deleted."
        action={<button onClick={() => navigate("/projects")} className="btn">Back to Projects</button>}
      />
    );
  }

  const isAdmin =
    project.ownerId === user?.id ||
    project.members?.some((m) => m.userId === user?.id && m.role === "ADMIN");

  const handleAddTask = (status: TaskStatus) => {
    setCreateTaskStatus(status);
    setShowCreateTask(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Projects
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${project.color}18` }}
          >
            <FolderKanban size={22} style={{ color: project.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{project.description}</p>
          </div>
          <button onClick={() => handleAddTask("TODO")} className="btn text-sm hidden sm:flex">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-glass overflow-x-auto">
        {tabs.map((tab) => {
          if (tab.id === "settings" && !isAdmin) return null;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive ? "text-brand-400" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {isActive && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters — shown on board and list tabs */}
      {(activeTab === "board" || activeTab === "list") && (
        <TaskFilters
          status={filterStatus}
          priority={filterPriority}
          assigneeId={filterAssignee}
          search={filterSearch}
          onStatusChange={setFilterStatus}
          onPriorityChange={setFilterPriority}
          onAssigneeChange={setFilterAssignee}
          onSearchChange={setFilterSearch}
          members={project.members || []}
        />
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "board" && (
            <div className="space-y-4">
              <QuickAddBar
                projectId={id!}
                onSubmit={(data) =>
                  createTaskMutation.mutate({
                    title: data.title,
                    dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
                    priority: data.priority || "MEDIUM",
                    status: "TODO",
                    assigneeId: user?.id,
                  })
                }
              />
              <KanbanBoard
                tasks={tasks || []}
                onStatusChange={(taskId, status) =>
                  updateTaskStatusMutation.mutate({ taskId, status })
                }
                onTaskClick={(task) => setSelectedTaskId(task.id)}
                onAddTask={handleAddTask}
              />
            </div>
          )}

          {activeTab === "list" && (
            <TaskListView
              tasks={tasks || []}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
            />
          )}

          {activeTab === "team" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Members ({project.members?.length || 0})</h3>
                {isAdmin && (
                  <button onClick={() => setShowAddMember(true)} className="btn text-sm">
                    <UserPlus size={15} /> Add Member
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.members?.map((member, i) => (
                  <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 flex items-center gap-3">
                    <Avatar name={member.user?.name || "?"} color={member.user?.avatarColor} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.user?.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{member.user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {member.role === "ADMIN" ? <ShieldCheck size={12} className="text-brand-400" /> : <Shield size={12} className="text-[var(--text-muted)]" />}
                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">{member.role}</span>
                      </div>
                    </div>
                    {isAdmin && member.userId !== project.ownerId && member.userId !== user?.id && (
                      <button onClick={() => { if (confirm(`Remove ${member.user?.name}?`)) removeMemberMutation.mutate(member.userId); }} className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Remove">
                        <UserMinus size={15} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "activity" && <ActivityFeed activities={activities?.activities || []} />}

          {activeTab === "settings" && isAdmin && (
            <div className="space-y-8 max-w-xl">
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Project Settings</h3>
                <ProjectForm
                  defaultValues={{ name: project.name, description: project.description, color: project.color }}
                  submitLabel="Save Changes"
                  onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
                />
              </div>
              <div className="glass rounded-xl p-6 border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Permanently remove all tasks, members, and history.</p>
                <button onClick={() => { if (confirm(`Delete "${project.name}"?`)) deleteMutation.mutate(); }} className="btn-danger">
                  <Trash2 size={15} /> Delete Project
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        projectId={id!}
        members={project.members || []}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Create Task Modal */}
      <Modal open={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task">
        <TaskForm
          members={project.members || []}
          defaultValues={{ status: createTaskStatus }}
          onSubmit={async (data) => { await createTaskMutation.mutateAsync(data); }}
        />
      </Modal>

      {/* Add Member Modal */}
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Add Team Member" size="sm">
        <AddMemberModalContent
          projectId={id!}
          onSuccess={() => { setShowAddMember(false); qc.invalidateQueries({ queryKey: ["project", id] }); }}
        />
      </Modal>
    </div>
  );
}

import { Search } from "lucide-react";
import type { ProjectMember } from "../../types";

interface TaskFiltersProps {
  status: string;
  priority: string;
  assigneeId: string;
  search: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onAssigneeChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  members: ProjectMember[];
}

export function TaskFilters({
  status, priority, assigneeId, search,
  onStatusChange, onPriorityChange, onAssigneeChange, onSearchChange,
  members,
}: TaskFiltersProps) {
  const activeCount = [status, priority, assigneeId].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="input pl-9 py-2 text-xs w-44"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status filter */}
      <select
        className="input py-2 text-xs w-32"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      {/* Priority filter */}
      <select
        className="input py-2 text-xs w-32"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
      >
        <option value="">All Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* Assignee filter */}
      <select
        className="input py-2 text-xs w-36"
        value={assigneeId}
        onChange={(e) => onAssigneeChange(e.target.value)}
      >
        <option value="">All Members</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>{m.user?.name}</option>
        ))}
      </select>

      {/* Active filter count */}
      {activeCount > 0 && (
        <button
          onClick={() => { onStatusChange(""); onPriorityChange(""); onAssigneeChange(""); }}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

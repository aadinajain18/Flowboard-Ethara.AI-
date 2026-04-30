import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { smartDueDate, urgencyColor } from "../../lib/dateUtils";
import { AlertTriangle, MessageSquare, Plus } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import type { Task, TaskStatus } from "../../types";
import confetti from "canvas-confetti";
import { playSound } from "../../lib/sounds";

// ─── Column config ──────────────────────────────────────
const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "#A09589" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#6B9EC4" },
  { id: "DONE", label: "Done", color: "#7CB87C" },
];

const priorityDot: Record<string, string> = {
  LOW: "#7CB87C",
  MEDIUM: "#D4A84B",
  HIGH: "#C75050",
  URGENT: "#D45050",
};

// ─── Sortable Task Card ─────────────────────────────────
function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="glass rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:bg-glass-hover transition-colors group"
    >
      <TaskCardContent task={task} />
    </div>
  );
}

function TaskCardContent({ task }: { task: Task }) {
  return (
    <>
      {/* Priority + labels row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: priorityDot[task.priority] || "#8B6085" }}
        />
        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase">
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug mb-2.5 line-clamp-2 group-hover:text-brand-300 transition-colors">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <Avatar
              name={task.assignee.name}
              color={task.assignee.avatarColor}
              size="sm"
            />
          )}
          {(() => {
            const due = smartDueDate(task.dueDate);
            return (
              <span
                className="text-[11px] font-medium"
                style={{ color: urgencyColor(due.urgency) }}
              >
                {due.isOverdue && <AlertTriangle size={10} className="inline mr-1" />}
                {due.label}
              </span>
            );
          })()}
        </div>
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          {(task._count?.comments || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageSquare size={10} />
              {task._count?.comments}
            </span>
          )}
          {(task._count?.subtasks || 0) > 0 && (
            <span className="text-[11px]">
              {task.subtasks?.filter((s) => s.status === "DONE").length || 0}/
              {task._count?.subtasks}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Kanban Board ───────────────────────────────────────
interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    tasks.forEach((t) => {
      if (grouped[t.status]) grouped[t.status].push(t);
    });
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task;
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target column
    let targetStatus: TaskStatus | null = null;

    // Dropped over a column droppable
    if (["TODO", "IN_PROGRESS", "DONE"].includes(over.id as string)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Dropped over another task — find which column that task is in
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      if (targetStatus === "DONE") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#7CB87C", "#8B6085", "#6B2D68", "#D4A84B"],
        });
        playSound("success");
      }
      onStatusChange(taskId, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            tasks={tasksByStatus[col.id]}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="glass rounded-lg p-3.5 w-[280px] shadow-glow-lg rotate-2 opacity-90">
            <TaskCardContent task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── Column ─────────────────────────────────────────────
function KanbanColumn({
  id,
  label,
  color,
  tasks,
  onTaskClick,
  onAddTask,
}: {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: "column" },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-xl bg-white/[0.015] border border-glass p-3"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">{label}</span>
          <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-glass text-[11px] font-medium text-[var(--text-muted)] px-1.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="rounded-md p-1 text-[var(--text-muted)] hover:bg-glass-hover hover:text-[var(--text-primary)] transition-colors"
          title="Add task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 min-h-[80px]">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <SortableTaskCard
                task={task}
                onClick={() => onTaskClick(task)}
              />
            </motion.div>
          ))}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-24 border border-dashed border-glass rounded-lg"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-1.5 text-[var(--text-muted)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="text-[11px]">Drop tasks here</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

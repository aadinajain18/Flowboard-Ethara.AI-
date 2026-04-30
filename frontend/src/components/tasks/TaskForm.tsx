import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { taskSchema } from "../../lib/schemas";
import type { z } from "zod";
import type { ProjectMember, Task } from "../../types";

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  members: ProjectMember[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  defaultValues?: Partial<Task>;
  submitLabel?: string;
}

export function TaskForm({
  members,
  onSubmit,
  defaultValues,
  submitLabel = "Create Task",
}: TaskFormProps) {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      status: defaultValues?.status || "TODO",
      priority: defaultValues?.priority || "MEDIUM",
      dueDate: defaultValues?.dueDate
        ? new Date(defaultValues.dueDate).toISOString().split("T")[0]
        : "",
      assigneeId: defaultValues?.assigneeId || "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input className="input" placeholder="Task title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="mt-1 text-xs text-red-400">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          className="input min-h-[70px] resize-none"
          placeholder="Optional description..."
          rows={3}
          {...form.register("description")}
        />
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select className="input" {...form.register("status")}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select className="input" {...form.register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Due Date + Assignee row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <input className="input" type="date" {...form.register("dueDate")} />
          {form.formState.errors.dueDate && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.dueDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Assignee</label>
          <select className="input" {...form.register("assigneeId")}>
            <option value="">Select member...</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user?.name}
              </option>
            ))}
          </select>
          {form.formState.errors.assigneeId && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.assigneeId.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={form.formState.isSubmitting} className="btn">
          {form.formState.isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

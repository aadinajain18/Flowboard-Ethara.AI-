import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { projectSchema } from "../../lib/schemas";
import type { z } from "zod";

type ProjectFormData = z.infer<typeof projectSchema>;

const PROJECT_COLORS = [
  "#8B6085", "#6B2D68", "#8B6085", "#8B6085", "#B86085",
  "#D45050", "#C75050", "#f97316", "#eab308", "#7CB87C",
  "#14b8a6", "#7BAFC4", "#6B9EC4", "#2563eb",
];

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  defaultValues?: Partial<ProjectFormData>;
  submitLabel?: string;
}

export function ProjectForm({
  onSubmit,
  defaultValues,
  submitLabel = "Create Project",
}: ProjectFormProps) {
  const [selectedColor, setSelectedColor] = useState(
    defaultValues?.color || "#8B6085"
  );

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      color: defaultValues?.color || "#8B6085",
      icon: defaultValues?.icon || "folder",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({ ...data, color: selectedColor });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <input
          className="input"
          placeholder="e.g., Marketing Website"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="mt-1.5 text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          className="input min-h-[80px] resize-none"
          placeholder="What's this project about?"
          rows={3}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="mt-1.5 text-xs text-red-400">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium mb-3">Color</label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className="h-7 w-7 rounded-full transition-all duration-200 ring-offset-2 ring-offset-[var(--bg-overlay)]"
              style={{
                backgroundColor: color,
                boxShadow:
                  selectedColor === color ? `0 0 0 2px ${color}` : "none",
                transform: selectedColor === color ? "scale(1.15)" : "scale(1)",
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="btn"
        >
          {form.formState.isSubmitting && (
            <Loader2 size={16} className="animate-spin" />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

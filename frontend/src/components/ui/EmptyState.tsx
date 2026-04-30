import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, text, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-glass text-[var(--text-muted)] mb-5">
        {icon || <FolderOpen size={28} />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">
        {text}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

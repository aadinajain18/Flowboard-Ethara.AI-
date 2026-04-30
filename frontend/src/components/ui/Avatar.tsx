interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({
  name,
  color = "#8B6085",
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeMap[size]} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}

interface AvatarStackProps {
  users: { name: string; avatarColor?: string }[];
  max?: number;
  size?: "sm" | "md";
}

export function AvatarStack({ users, max = 4, size = "sm" }: AvatarStackProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u, i) => (
        <Avatar
          key={i}
          name={u.name}
          color={u.avatarColor || "#8B6085"}
          size={size}
          className="ring-2 ring-surface-raised"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`inline-flex shrink-0 items-center justify-center rounded-full bg-surface-overlay font-medium text-[var(--text-secondary)] ring-2 ring-surface-raised ${sizeMap[size]}`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

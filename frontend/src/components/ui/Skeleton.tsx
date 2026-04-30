export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-16 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return <div className="skeleton h-72 rounded-xl" />;
}

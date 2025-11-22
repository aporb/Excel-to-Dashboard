export function ChartSkeleton() {
  return (
    <div className="glass-standard rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton-avatar" />
        <div className="space-y-2 flex-1">
          <div className="skeleton-title" />
          <div className="skeleton-text w-2/3" />
        </div>
      </div>
      <div className="skeleton-card" />
    </div>
  );
}

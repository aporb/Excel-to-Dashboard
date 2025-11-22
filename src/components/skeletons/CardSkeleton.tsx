export function CardSkeleton() {
  return (
    <div className="glass-standard rounded-xl p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="skeleton-avatar" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-title w-3/4" />
            <div className="skeleton-text w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton-text" />
          <div className="skeleton-text w-5/6" />
          <div className="skeleton-text w-4/6" />
        </div>
      </div>
    </div>
  );
}

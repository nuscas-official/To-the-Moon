export default function RatingsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 text-left">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-6 mb-8 animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/3 mb-2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-1/2" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel border border-border/60 rounded-2xl p-5 flex gap-4 h-[120px]">
            {/* Mock Cover Image */}
            <div className="w-16 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex-shrink-0" />
            
            {/* Mock Text & Info */}
            <div className="flex-grow space-y-3 py-1">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              <div className="flex gap-2 items-center pt-1">
                <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-10" />
                <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EventsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 text-left">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-6 mb-8 animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-1/3 mb-2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-8 animate-pulse border-b border-border pb-2">
        <div className="h-8 w-28 bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-28 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Grid/List of Event Cards */}
      <div className="space-y-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border/60 p-6 flex flex-col md:flex-row gap-6">
            {/* Mock Event Image */}
            <div className="w-full md:w-48 h-32 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            
            {/* Mock Info */}
            <div className="flex-grow space-y-3 py-1">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
              <div className="flex gap-4">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-28" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-20" />
              </div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-5/6" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BlogLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 text-left">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-6 mb-8 animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-1/4 mb-2" />
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 mb-8 animate-pulse overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            {/* Mock Cover Image */}
            <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800 border border-border/60" />
            
            {/* Tag & Date */}
            <div className="flex items-center gap-2">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 w-12" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-16" />
            </div>

            {/* Title & Excerpt */}
            <div className="space-y-2">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 w-11/12" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-full" />
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-2/3" />
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

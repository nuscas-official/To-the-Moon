export default function Loading() {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent/20 animate-pulse" />
        <div className="absolute w-12 h-12 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-xs font-bold tracking-widest uppercase text-text-muted animate-pulse">
        Loading Portal...
      </p>
    </div>
  )
}

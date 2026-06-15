import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
      <div className="max-w-md w-full space-y-6 glass-panel rounded-2xl p-8 sm:p-10 border border-border/60 shadow-lg relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        {/* 404 Large Label */}
        <div className="text-6xl sm:text-8xl font-black text-accent tracking-tighter select-none animate-pulse">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Lost in another timeline?
          </h1>
          <p className="text-sm text-text-muted">
            The page you are looking for doesn&apos;t exist, was deleted, or resides in an alternate reality.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-accent-foreground bg-accent hover:bg-accent-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

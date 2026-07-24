'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Captured runtime error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in">
      <div className="max-w-md w-full space-y-6 rounded-2xl p-8 sm:p-10 border border-border/60 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 text-accent border border-accent/20">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-text-muted">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
          {error.message && (
            <div className="mt-4 p-3 rounded-lg bg-neutral-100 border border-border/80 text-left">
              <p className="text-xs font-mono text-text-muted break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-accent-foreground bg-accent hover:bg-accent-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold border border-border bg-surface hover:bg-surface-hover text-neutral-700 hover:text-neutral-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

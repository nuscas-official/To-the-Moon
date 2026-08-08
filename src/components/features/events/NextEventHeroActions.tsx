'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon'

interface NextEventHeroActionsProps {
  slug: string
  /** Anchor the "More events" button scrolls to. */
  scrollTarget?: string
}

export default function NextEventHeroActions({
  slug,
  scrollTarget = '#events-section',
}: NextEventHeroActionsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Same contract as EventCard: `?event=<slug>` is what EventDetailModal
  // listens for, and scroll={false} keeps the hero in place behind it.
  const params = new URLSearchParams(searchParams.toString())
  params.set('event', slug)
  const modalHref = `${pathname}?${params.toString()}`

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <Link
        href={modalHref}
        scroll={false}
        className="clip-cut cut-md inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-90 hover:gap-3"
      >
        Event details
        <ArrowRightIcon className="w-4 h-4" />
      </Link>

      {/* Stays on the page — the full grid is just below the fold. Falls back
          to the plain anchor jump if the click handler never runs. */}
      <a
        href={scrollTarget}
        onClick={(e) => {
          const target = document.querySelector(scrollTarget)
          if (!target) return
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth' })
        }}
        className="clip-cut cut-md inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-colors hover:border-white/70 hover:bg-white/10"
      >
        More events
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </a>
    </div>
  )
}

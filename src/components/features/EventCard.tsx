'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
}

interface EventCardProps {
  event: ClubEvent
  detailsLabel?: string // e.g. "View" or "Details"
}

// Card entry animation settings
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 95,
      damping: 15,
    },
  },
}

export default function EventCard({ event, detailsLabel = 'View' }: EventCardProps) {
  const dateStr = new Date(event.starts_at).toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = new Date(event.starts_at).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      variants={cardVariants}
      className="group flex flex-col justify-between overflow-hidden border-2 border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 chaos-card-active text-left"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-neutral-100 overflow-hidden border-b border-border">
        {event.cover_image_key ? (
          <Image
            src={event.cover_image_key}
            alt={event.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-muted to-accent/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Status Badge */}
        <span className="absolute top-3 right-3 text-[10px] uppercase font-extrabold tracking-wider bg-neutral-900/80 backdrop-blur text-white px-2.5 py-1 rounded-full border border-white/10">
          {event.status}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Time Info */}
          <div className="flex items-center gap-1.5 text-xs text-accent font-bold mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dateStr} &middot; {timeStr}</span>
          </div>

          <h3 className="text-lg font-black text-foreground line-clamp-1 group-hover:text-accent-hover transition-colors">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
          <span className="text-text-muted flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1 max-w-[150px]">{event.location || 'Online'}</span>
          </span>

          <Link
            href={`/events/${event.slug}`}
            className="font-extrabold text-accent group-hover:underline flex items-center gap-0.5"
          >
            <span>{detailsLabel}</span>
            <svg className="w-3.5 h-3.5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Reusable Placeholder / Empty State Card
export function EventPlaceholderCard({ index }: { index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-left min-h-[200px] transition-all hover:border-foreground/60 shadow-sm"
    >
      <div>
        <div className="w-8 h-8 rounded-lg bg-border/60 flex items-center justify-center text-text-muted mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-text-muted">
          Event Slot {index}
        </h3>
        <p className="text-xs text-text-muted mt-2 leading-relaxed">
          Details for this upcoming activity are being finalized by the EXCO committee. Check back soon!
        </p>
      </div>
      <div className="text-[10px] uppercase tracking-wider font-black text-text-muted mt-4 border-t border-border pt-3">
        Status: Gated / Pending RLS
      </div>
    </motion.div>
  )
}

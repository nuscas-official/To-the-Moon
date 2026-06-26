'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import EventCard, { EventPlaceholderCard } from './EventCard'
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

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

interface EventsListClientProps {
  events: ClubEvent[]
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -30, y: 10 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 15,
    },
  },
}

export default function EventsListClient({ events }: EventsListClientProps) {
  const hasEvents = events && events.length > 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="w-full"
    >
      {/* Section Header with rise-from-left entry animation */}
      <motion.div 
        variants={headerVariants}
        className="flex flex-col sm:flex-row items-baseline justify-between border-b border-border pb-4 mb-8"
      >
        <div>
          <span className="text-xl font-display tracking-widest text-accent">
            Our Activities
          </span>
          <p className="text-4xl md:text-5xl tracking-tight text-foreground font-serif py-2">
            Events
          </p>
          <p className="text-sm text-text-muted mt-2">
            Don&apos;t miss out on what we have planned for the semester
          </p>
        </div>
        {hasEvents && (
          <Link
            href="/events"
            className="group inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors self-start sm:self-end"
          >
            All Events
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </motion.div>

      {/* Grid of Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hasEvents ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} detailsLabel="View" />
          ))
        ) : (
          [1, 2, 3].map((i) => (
            <EventPlaceholderCard key={i} index={i} />
          ))
        )}
      </div>
    </motion.div>
  )
}

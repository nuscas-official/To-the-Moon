'use client'

import React, { useState } from 'react'
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
  departments: string[];
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

const DEPARTMENTS = [
  { name: 'CASuals', activeClass: 'bg-sky-50 border-sky-300 text-sky-800 ring-1 ring-sky-300 font-extrabold shadow-sm' },
  { name: 'TOPICS', activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300 font-extrabold shadow-sm' },
  { name: 'Palette', activeClass: 'bg-pink-50 border-pink-300 text-pink-800 ring-1 ring-pink-300 font-extrabold shadow-sm' },
]

export default function EventsListClient({ events }: EventsListClientProps) {
  const hasEvents = events && events.length > 0
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

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

      {/* Department Filter Pills */}
      {hasEvents && (
        <motion.div
          variants={headerVariants}
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted mr-2">
            Filter by Department:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDept(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedDept === null
                ? 'bg-foreground text-surface shadow-sm'
                : 'bg-surface hover:bg-neutral-500/10 text-text-muted'
            }`}
          >
            All
          </button>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.name}
              type="button"
              onClick={() => setSelectedDept(dept.name === selectedDept ? null : dept.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedDept === dept.name
                  ? dept.activeClass
                  : 'bg-surface border-border text-text-muted hover:bg-neutral-500/10 hover:text-foreground'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid of Event Cards — up to 2 rows of 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasEvents ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              detailsLabel="View"
              dimmed={selectedDept !== null && !event.departments?.includes(selectedDept)}
            />
          ))
        ) : (
          [1, 2, 3, 4].map((i) => (
            <EventPlaceholderCard key={i} index={i} />
          ))
        )}
      </div>
    </motion.div>
  )
}

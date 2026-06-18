'use client'

import React from 'react'
import { motion } from 'framer-motion'
import EventCard, { EventPlaceholderCard } from './EventCard'

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
      staggerChildren: 0.12,
    },
  },
}

export default function EventsListClient({ events }: EventsListClientProps) {
  const hasEvents = events && events.length > 0

  if (!hasEvents) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[1, 2, 3].map((i) => (
          <EventPlaceholderCard key={i} index={i} />
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} detailsLabel="View" />
      ))}
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import EventCard from './EventCard'

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

interface EventsTabsProps {
  upcomingEvents: ClubEvent[];
  pastEvents: ClubEvent[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export default function EventsTabs({ upcomingEvents, pastEvents }: EventsTabsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  const hasEvents = currentEvents.length > 0

  return (
    <div className="w-full space-y-8">
      {/* Tab Selectors */}
      <div className="flex border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 px-6 font-black text-sm uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'upcoming'
              ? 'border-accent text-accent font-extrabold'
              : 'border-transparent text-text-muted hover:text-neutral-700'
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-4 px-6 font-black text-sm uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'past'
              ? 'border-accent text-accent font-extrabold'
              : 'border-transparent text-text-muted hover:text-neutral-700'
          }`}
        >
          Past ({pastEvents.length})
        </button>
      </div>

      {/* Grid List */}
      {!hasEvents ? (
        <motion.div 
          key={`empty-${activeTab}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-8"
        >
          <div className="w-12 h-12 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-neutral-700">
            {activeTab === 'upcoming' ? 'No Upcoming Events' : 'No Past Events'}
          </h3>
          <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">
            {activeTab === 'upcoming'
              ? 'We are currently planning our next activities! Keep an eye on our Discord channel or check back here soon.'
              : 'There are no past events logged in the database yet. Check back as the semester progresses!'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentEvents.map((event) => (
            <EventCard key={event.id} event={event} detailsLabel="Details" />
          ))}
        </motion.div>
      )}
    </div>
  )
}

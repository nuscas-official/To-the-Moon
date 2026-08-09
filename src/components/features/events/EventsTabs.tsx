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
  departments: string[];
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
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  const tabHasEvents = currentEvents.length > 0

  // A NUSCAS (general club) event has no organizing department assigned
  const filteredEvents = selectedDept
    ? currentEvents.filter(e =>
        selectedDept === 'NUSCAS'
          ? !e.departments || e.departments.length === 0
          : e.departments?.includes(selectedDept)
      )
    : currentEvents

  const hasEvents = filteredEvents.length > 0

  return (
    <div className="w-full space-y-8">
      {/* Tab Selectors */}
      <div className="flex border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-4 px-6 font-black text-sm uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'upcoming'
              ? 'border-accent text-accent font-extrabold'
              : 'border-transparent text-text-muted hover:text-neutral-700'
          }`}
        >
          Upcoming ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`py-4 px-6 font-black text-sm uppercase tracking-wider border-b-2 transition-all relative ${
            activeTab === 'past'
              ? 'border-accent text-accent font-extrabold'
              : 'border-transparent text-text-muted hover:text-neutral-700'
          }`}
        >
          Past ({pastEvents.length})
        </button>
      </div>
      
      {/* Department Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mr-2">
          Filter by Department:
        </span>
        <button
          type="button"
          onClick={() => setSelectedDept(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            selectedDept === null
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-neutral-100 hover:bg-neutral-200 text-text-muted'
          }`}
        >
          All
        </button>
        {[
          { name: 'NUSCAS', activeClass: 'bg-violet-50 border-violet-300 text-violet-800 ring-1 ring-violet-300 font-extrabold shadow-sm' },
          { name: 'CASuals', activeClass: 'bg-sky-50 border-sky-300 text-sky-800 ring-1 ring-sky-300 font-extrabold shadow-sm' },
          { name: 'TOPICS', activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300 font-extrabold shadow-sm' },
          { name: 'Palette', activeClass: 'bg-pink-50 border-pink-300 text-pink-800 ring-1 ring-pink-300 font-extrabold shadow-sm' }
        ].map((dept) => (
          <button
            key={dept.name}
            type="button"
            onClick={() => setSelectedDept(dept.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedDept === dept.name
                ? dept.activeClass
                : 'bg-surface border-border text-text-muted hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {!tabHasEvents ? (
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
      ) : !hasEvents ? (
        <motion.div 
          key={`empty-filter-${activeTab}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-8"
        >
          <div className="w-12 h-12 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-neutral-700">
            No Events Found
          </h3>
          <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">
            There are no events organized by {selectedDept} in the {activeTab} section.
          </p>
          <button
            onClick={() => setSelectedDept(null)}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-lg active:scale-95"
          >
            Clear Filter
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key={`${activeTab}-${selectedDept || 'all'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} detailsLabel="Details" />
          ))}
        </motion.div>
      )}
    </div>
  )
}

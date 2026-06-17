'use client'

import { useState } from 'react'
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

interface EventsTabsProps {
  upcomingEvents: ClubEvent[];
  pastEvents: ClubEvent[];
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
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-8">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => {
            const startDate = new Date(event.starts_at)
            const dateStr = startDate.toLocaleDateString('en-SG', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const timeStr = startDate.toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={event.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 chaos-card-active text-left"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full bg-neutral-100 overflow-hidden border-b border-border">
                  {event.cover_image_key ? (
                    <Image
                      src={event.cover_image_key}
                      alt={event.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 400px"
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

                    <h3 className="text-lg font-black text-neutral-800 line-clamp-1 group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Stats / Details Link */}
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
                      <span>Details</span>
                      <svg className="w-3.5 h-3.5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

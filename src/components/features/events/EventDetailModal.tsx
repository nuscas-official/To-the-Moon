'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface EventPhoto {
  id: string;
  storage_key: string;
  alt_text: string | null;
  display_order: number;
}

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

export default function EventDetailModal() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const eventSlug = searchParams.get('event')

  const [event, setEvent] = useState<ClubEvent | null>(null)
  const [photos, setPhotos] = useState<EventPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch event details and photos when slug changes
  useEffect(() => {
    if (!eventSlug) {
      setEvent(null)
      setPhotos([])
      setError(null)
      return
    }

    async function fetchEventDetails() {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        
        // 1. Fetch Event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('slug', eventSlug)
          .neq('status', 'cancelled')
          .maybeSingle()

        if (eventError) throw eventError
        if (!eventData) {
          setError('Event not found')
          setEvent(null)
          return
        }

        const clubEvent = eventData as ClubEvent
        setEvent(clubEvent)

        // 2. Fetch Photos
        const { data: photosData, error: photosError } = await supabase
          .from('event_photos')
          .select('id, storage_key, alt_text, display_order')
          .eq('event_id', clubEvent.id)
          .order('display_order', { ascending: true })

        if (photosError) throw photosError
        setPhotos((photosData as EventPhoto[]) || [])
      } catch (err) {
        console.error('Error fetching event details:', err)
        setError('Failed to load event details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventSlug])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (eventSlug) {
      const originalStyle = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [eventSlug])

  // Handle Close Action
  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('event')
    // Router navigation without scrolling to top
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, searchParams])

  // Handle Escape Key Close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    if (eventSlug) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [eventSlug, handleClose])

  // Helpers for date/time formatting
  const getFormattedDates = (startsAt: string, endsAt: string | null) => {
    const startDate = new Date(startsAt)
    const dateStr = startDate.toLocaleDateString('en-SG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const startTimeStr = startDate.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
    })

    let timeRangeStr = startTimeStr
    if (endsAt) {
      const endDate = new Date(endsAt)
      const endTimeStr = endDate.toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
      })
      
      if (startDate.toDateString() === endDate.toDateString()) {
        timeRangeStr = `${startTimeStr} - ${endTimeStr}`
      } else {
        const endDateStr = endDate.toLocaleDateString('en-SG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        timeRangeStr = `${startTimeStr} until ${endDateStr}, ${endTimeStr}`
      }
    }
    return { dateStr, timeRangeStr }
  }

  const dateDetails = event ? getFormattedDates(event.starts_at, event.ends_at) : null

  return (
    <AnimatePresence>
      {eventSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-zoom-out"
          />

          {/* Lightbox Modal Window */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-4xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-crimson shadow-2xl flex flex-col text-left z-10 scrollbar-thin"
          >
            {/* Header Sticky Action Area (Close Button overlay) */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center border border-white/20 hover:scale-105 hover:border-white/40 active:scale-95 transition-all outline-none"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Skeleton Loading State */}
            {loading && (
              <div className="w-full flex flex-col">
                <div className="h-64 sm:h-80 w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse border-b border-border" />
                <div className="p-6 sm:p-10 space-y-8">
                  <div className="space-y-3">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-3/4 animate-pulse" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/2 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/80">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
                      <div className="space-y-2 flex-grow">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/4 animate-pulse" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-3/4 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
                      <div className="space-y-2 flex-grow">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/4 animate-pulse" />
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-3/4 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-5/6 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 text-accent flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Something Went Wrong</h3>
                <p className="text-sm text-text-muted max-w-md">{error}</p>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-accent text-white font-extrabold text-sm uppercase tracking-wider hover:bg-accent-hover transition-colors"
                >
                  Close Lightbox
                </button>
              </div>
            )}

            {/* Content Loaded State */}
            {!loading && !error && event && (
              <div className="w-full flex flex-col">
                
                {/* Banner Cover Image */}
                <div className="relative h-56 sm:h-80 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden shrink-0">
                  {event.cover_image_key ? (
                    <Image
                      src={event.cover_image_key}
                      alt={event.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-muted to-accent/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge */}
                  <span className="absolute top-4 left-4 text-[10px] uppercase font-extrabold tracking-wider bg-neutral-900/85 backdrop-blur text-white px-3 py-1.5 rounded-full border border-white/10">
                    {event.status}
                  </span>
                </div>

                {/* Event Details and Gallery Info */}
                <div className="p-6 sm:p-10 space-y-8 flex-grow">
                  
                  {/* Title & Timing Grid */}
                  <div>
                    <h1 className="text-xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-snug">
                      {event.title}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/80">
                      {/* Date & Time Column */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-black tracking-wider text-text-muted">Date</div>
                          <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{dateDetails?.dateStr}</div>
                          <div className="text-xs text-text-muted mt-0.5">{dateDetails?.timeRangeStr}</div>
                        </div>
                      </div>

                      {/* Location Column */}
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-black tracking-wider text-text-muted">Location</div>
                          <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{event.location || 'Online / Discord'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <div className="py-2">
                      <h2 className="text-xs uppercase tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500 mb-3">About the Event</h2>
                      <div className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {event.description}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Photo Gallery */}
                  {photos.length > 0 && (
                    <div className="pt-4 space-y-6">
                      <div className="border-b border-border pb-3">
                        <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                          Memory Lane & Gallery
                        </h2>
                        <p className="text-xs text-text-muted mt-1">
                          Photos from the activity uploaded by committee members and attendees.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative h-48 overflow-hidden border border-border bg-neutral-100 dark:bg-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 chaos-card-active"
                          >
                            <Image
                              src={photo.storage_key}
                              alt={photo.alt_text || 'Event photo'}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {photo.alt_text && (
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white text-[11px] font-semibold leading-snug">
                                  {photo.alt_text}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

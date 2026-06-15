import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

export const revalidate = 0 // Disable cache for real-time accuracy

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, cover_image_key')
    .eq('slug', params.slug)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (!event) {
    return {
      title: 'Event Not Found | NUSCAS',
    }
  }

  return {
    title: `${event.title} | NUSCAS Events`,
    description: event.description || 'Club activities and events.',
    openGraph: {
      title: event.title,
      description: event.description || 'Club activities and events.',
      images: event.cover_image_key ? [{ url: event.cover_image_key }] : [],
    },
  }
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // 1. Fetch Event Details (excluding cancelled ones for public page)
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (eventError || !eventData) {
    notFound()
  }

  const event = eventData as ClubEvent

  // 2. Fetch Event Photos ordered by display_order
  const { data: photosData, error: photosError } = await supabase
    .from('event_photos')
    .select('id, storage_key, alt_text, display_order')
    .eq('event_id', event.id)
    .order('display_order', { ascending: true })

  if (photosError) {
    console.error('Error fetching event photos:', photosError)
  }

  const photos = (photosData as EventPhoto[]) || []

  // Date/Time Formatting
  const startDate = new Date(event.starts_at)
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
  if (event.ends_at) {
    const endDate = new Date(event.ends_at)
    const endTimeStr = endDate.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
    })
    
    // Check if ends on same day
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

  return (
    <div className="w-full max-w-5xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back Link */}
      <Link 
        href="/events" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Activities</span>
      </Link>

      {/* Main Grid Card */}
      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden mb-12">
        {/* Cover Banner */}
        <div className="relative h-64 sm:h-96 w-full bg-neutral-100 overflow-hidden border-b border-border">
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
              <svg className="w-20 h-20 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <span className="absolute top-4 right-4 text-xs uppercase font-extrabold tracking-wider bg-neutral-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full border border-white/10">
            {event.status}
          </span>
        </div>

        {/* Details Section */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Header & Date/Location info */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/80">
              {/* Date Column */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-text-muted">Date</div>
                  <div className="text-sm font-bold text-neutral-800 mt-0.5">{dateStr}</div>
                  <div className="text-xs text-text-muted mt-0.5">{timeRangeStr}</div>
                </div>
              </div>

              {/* Location Column */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-text-muted">Location</div>
                  <div className="text-sm font-bold text-neutral-800 mt-0.5">{event.location || 'Online / Discord'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-2">
              <h2 className="text-sm uppercase tracking-wider font-extrabold text-neutral-400 mb-3">About the Event</h2>
              <div className="text-neutral-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Photo Gallery Section */}
      {photos.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
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
                className="group relative h-60 overflow-hidden rounded-2xl border border-border bg-neutral-100 shadow-sm hover:shadow-md hover:border-accent/20 transition-all duration-300 chaos-card-active"
              >
                <Image
                  src={photo.storage_key}
                  alt={photo.alt_text || 'Event photo'}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {photo.alt_text && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-semibold leading-snug">
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
  )
}

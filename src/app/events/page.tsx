import { createClient } from '@/lib/supabase/server'
import EventsTabs from '@/components/features/events/EventsTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Events & Activities",
  description: "Check out upcoming and past events hosted by our university anime club, including screenings, workshops, and gatherings.",
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
  departments: string[];
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function EventsPage() {
  const supabase = createClient()

  // Fetch all active (non-cancelled) events: most recent starts_at first
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: false })

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
  }

  const allEvents = (eventsData as ClubEvent[]) || []
  const now = new Date()

  // Dynamically filter upcoming and past events based on time
  const upcomingEvents = allEvents.filter(
    (event) => event.status === 'upcoming' && new Date(event.starts_at) >= now
  )
  const pastEvents = allEvents.filter(
    (event) => event.status === 'past' || (event.status === 'upcoming' && new Date(event.starts_at) < now)
  )

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Club Activities & Events
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Join our screenings, art workshops, social gatherings, and other events.
        </p>
      </div>

      {/* Interactive Tabs List */}
      <EventsTabs upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </div>
  )
}

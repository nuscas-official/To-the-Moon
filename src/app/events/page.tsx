import { createClient } from '@/lib/supabase/server'
import EventsTabs from '@/components/features/EventsTabs'

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

export default async function EventsPage() {
  const supabase = createClient()

  // 1. Fetch upcoming events: soonest first
  const { data: upcomingData, error: upcomingError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .order('starts_at', { ascending: true })

  if (upcomingError) {
    console.error('Error fetching upcoming events:', upcomingError)
  }

  // 2. Fetch past events: most recent first
  const { data: pastData, error: pastError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'past')
    .order('starts_at', { ascending: false })

  if (pastError) {
    console.error('Error fetching past events:', pastError)
  }

  const upcomingEvents = (upcomingData as ClubEvent[]) || []
  const pastEvents = (pastData as ClubEvent[]) || []

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

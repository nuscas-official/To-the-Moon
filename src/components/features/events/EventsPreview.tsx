import { createClient } from '@/lib/supabase/server'
import EventsListClient from './EventsListClient'

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

export default async function EventsPreview() {
  let events: ClubEvent[] = []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, description, starts_at, ends_at, location, status, cover_image_key, departments')
      .neq('status', 'cancelled')
      .order('starts_at', { ascending: false })
      .limit(24)

    if (!error && data) {
      const allEvents = data as ClubEvent[]
      const now = new Date()

      // Sort upcoming events: soonest first
      const upcoming = allEvents
        .filter(e => e.status === 'upcoming' && new Date(e.starts_at) >= now)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

      // Sort past events: most recent first
      const past = allEvents
        .filter(e => e.status === 'past' || (e.status === 'upcoming' && new Date(e.starts_at) < now))
        .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

      // Prioritize upcoming events first, then fill with past events, up to 2 rows of 4
      events = [...upcoming, ...past].slice(0, 8)
    }
  } catch (err) {
    console.error('Failed to query events table:', err)
  }

  return (
    <section className="w-full">
      <EventsListClient events={events} />
    </section>
  )
}

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
}

export default async function EventsPreview() {
  let events: ClubEvent[] = []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true })
      .limit(3)

    if (!error && data) {
      events = data as ClubEvent[]
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

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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

  const hasEvents = events && events.length > 0

  return (
    <section className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-baseline justify-between border-b border-border pb-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Events
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Don&apos;t miss out on what we have planned for the semester
          </p>
        </div>
        {hasEvents && (
          <Link 
            href="/events"
            className="text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover transition-colors mt-2 sm:mt-0"
          >
            All Events &rarr;
          </Link>
        )}
      </div>

      <EventsListClient events={events} />
    </section>
  )
}

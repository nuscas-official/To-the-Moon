import { createClient } from '@/lib/supabase/server'
import EventsTabs from '@/components/features/events/EventsTabs'
import JsonLd from '@/components/JsonLd'
import PageHeader from '@/components/ui/PageHeader'
import type { ClubEvent } from '@/lib/events'
import { SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'

interface EventsPageProps {
  searchParams?: { event?: string }
}

const LISTING_DESCRIPTION =
  "Upcoming and past NUSCAS events at NUS: anime screenings, art and cosplay workshops, gaming tournaments, convention booths, and socials. Open to all NUS students."

/**
 * `?event=<slug>` opens the detail modal over this listing. That's the same
 * content as /events/<slug>, so point the canonical there and let the real
 * page carry the indexing weight.
 */
export async function generateMetadata({ searchParams }: EventsPageProps): Promise<Metadata> {
  const slug = searchParams?.event
  return {
    title: "Events",
    description: LISTING_DESCRIPTION,
    alternates: {
      canonical: slug ? `${SITE_URL}/events/${slug}` : `${SITE_URL}/events`,
    },
    openGraph: {
      title: "Events | NUSCAS",
      description: LISTING_DESCRIPTION,
      url: `${SITE_URL}/events`,
      type: 'website',
    },
  }
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

  // Upcoming events are what search engines can usefully surface; each entry
  // resolves to its own page, which carries the full Event markup.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Upcoming NUSCAS events',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: upcomingEvents.length,
    itemListElement: upcomingEvents.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: event.title,
      url: `${SITE_URL}/events/${event.slug}`,
    })),
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      {upcomingEvents.length > 0 && <JsonLd data={itemListJsonLd} />}

      {/* Header */}
      <PageHeader
        eyebrow="Our Activities"
        title="Events"
        description="Don't miss out on what we have planned for the semester"
      />

      {/* Interactive Tabs List */}
      <EventsTabs upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </div>
  )
}

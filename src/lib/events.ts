import { createClient } from '@/lib/supabase/server'
import { createClient as createBaseClient } from '@supabase/supabase-js'

export interface ClubEvent {
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

export const EVENT_COLUMNS =
  'id, title, slug, description, starts_at, ends_at, location, status, cover_image_key, departments'

export interface HeroEventResult {
  event: ClubEvent | null
  /** False when we fell back to the most recent past event. */
  isUpcoming: boolean
}

/**
 * The single event the homepage leads with: the soonest thing still to come,
 * or the most recent thing we ran if the calendar is empty (between semesters).
 *
 * The homepage grid excludes whatever this returns, so both call sites must
 * agree on the choice — hence one shared function rather than two queries.
 */
export async function getHeroEvent(): Promise<HeroEventResult> {
  try {
    const supabase = createClient()
    const nowIso = new Date().toISOString()

    const { data: upcoming } = await supabase
      .from('events')
      .select(EVENT_COLUMNS)
      .eq('status', 'upcoming')
      .gte('starts_at', nowIso)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (upcoming) return { event: upcoming as ClubEvent, isUpcoming: true }

    const { data: recent } = await supabase
      .from('events')
      .select(EVENT_COLUMNS)
      .neq('status', 'cancelled')
      .lt('starts_at', nowIso)
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return { event: (recent as ClubEvent) ?? null, isUpcoming: false }
  } catch (err) {
    console.error('Failed to load hero event:', err)
    return { event: null, isUpcoming: false }
  }
}

export interface EventPhoto {
  id: string;
  storage_key: string;
  alt_text: string | null;
  display_order: number;
}

/**
 * Cookie-free client for public event reads. `createClient()` from
 * supabase/server touches cookies(), which opts the route into dynamic
 * rendering — event detail pages want to be cacheable, so they use this.
 */
function createPublicClient() {
  return createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

export async function getEventBySlug(slug: string): Promise<ClubEvent | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('slug', slug)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (error) {
    console.error(`Failed to load event "${slug}":`, error)
    return null
  }
  return (data as ClubEvent) ?? null
}

export async function getEventPhotos(eventId: string): Promise<EventPhoto[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('event_photos')
    .select('id, storage_key, alt_text, display_order')
    .eq('event_id', eventId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error(`Failed to load photos for event ${eventId}:`, error)
    return []
  }
  return (data as EventPhoto[]) ?? []
}

/** Trimmed, single-line description suitable for meta tags. */
export function eventMetaDescription(event: ClubEvent): string {
  const when = new Date(event.starts_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const where = event.location ? ` at ${event.location}` : ''
  const lead = `${event.title} — a NUSCAS event on ${when}${where}.`

  if (!event.description) return `${lead} Join the NUS Comics and Animation Society.`

  const body = event.description.replace(/\s+/g, ' ').trim()
  const room = 300 - lead.length - 1
  const snippet = body.length > room ? `${body.slice(0, room - 1).trimEnd()}…` : body
  return `${lead} ${snippet}`
}

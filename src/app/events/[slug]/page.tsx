import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/JsonLd'
import { getEventBySlug, getEventPhotos, eventMetaDescription, type ClubEvent } from '@/lib/events'
import { SITE_URL, SITE_NAME, ORG_ID, DEFAULT_OG_IMAGE } from '@/lib/site'

// Events change rarely once published; five minutes keeps the page cacheable
// while still picking up committee edits quickly.
export const revalidate = 300

interface EventPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug)

  if (!event) {
    return {
      title: 'Event not found',
      robots: { index: false, follow: true },
    }
  }

  const description = eventMetaDescription(event)
  const url = `${SITE_URL}/events/${event.slug}`
  const image = event.cover_image_key || DEFAULT_OG_IMAGE

  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: event.title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [image],
    },
  }
}

const DEPT_BADGE: Record<string, string> = {
  NUSCAS: 'bg-violet-50 text-violet-700 border-violet-100',
  Joint: 'bg-amber-50 text-amber-700 border-amber-200',
  CASuals: 'bg-sky-50 text-sky-700 border-sky-100',
  TOPICS: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Palette: 'bg-pink-50 text-pink-700 border-pink-100',
}

function departmentLabels(departments: string[]): string[] {
  if (!departments || departments.length === 0) return ['NUSCAS']
  if (departments.length === 3) return ['Joint']
  return departments
}

function formatDates(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt)
  const dateStr = start.toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const startTime = start.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })

  if (!endsAt) return { dateStr, timeStr: startTime }

  const end = new Date(endsAt)
  const endTime = end.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })

  if (start.toDateString() === end.toDateString()) {
    return { dateStr, timeStr: `${startTime} – ${endTime}` }
  }

  const endDateStr = end.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return { dateStr, timeStr: `${startTime} until ${endDateStr}, ${endTime}` }
}

function buildJsonLd(event: ClubEvent, photos: { storage_key: string }[]) {
  const url = `${SITE_URL}/events/${event.slug}`
  const isPast = new Date(event.starts_at) < new Date()
  const images = [event.cover_image_key, ...photos.map((p) => p.storage_key)].filter(
    (src): src is string => Boolean(src)
  )

  // A named room/venue is a physical Place; anything else we treat as online,
  // which is how the UI already reads a missing location.
  const location = event.location
    ? {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Singapore',
          addressCountry: 'SG',
        },
      }
    : { '@type': 'VirtualLocation', url }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id': `${url}#event`,
      name: event.title,
      url,
      startDate: event.starts_at,
      ...(event.ends_at ? { endDate: event.ends_at } : {}),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: event.location
        ? 'https://schema.org/OfflineEventAttendanceMode'
        : 'https://schema.org/OnlineEventAttendanceMode',
      location,
      ...(images.length > 0 ? { image: images } : {}),
      ...(event.description ? { description: event.description.replace(/\s+/g, ' ').trim() } : {}),
      isAccessibleForFree: true,
      organizer: { '@id': ORG_ID },
      performer: { '@id': ORG_ID },
      ...(isPast
        ? {}
        : {
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'SGD',
              availability: 'https://schema.org/InStock',
              url,
              validFrom: new Date().toISOString(),
            },
          }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Events', item: `${SITE_URL}/events` },
        { '@type': 'ListItem', position: 3, name: event.title, item: url },
      ],
    },
  ]
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const event = await getEventBySlug(params.slug)
  if (!event) notFound()

  const photos = await getEventPhotos(event.id)
  const { dateStr, timeStr } = formatDates(event.starts_at, event.ends_at)
  const isPast = new Date(event.starts_at) < new Date()

  return (
    <article className="w-full max-w-5xl mx-auto py-6 animate-fade-in text-left">
      <JsonLd data={buildJsonLd(event, photos)} />

      {/* Breadcrumbs, mirroring the BreadcrumbList above */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
          <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/events" className="hover:text-accent transition-colors">Events</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground line-clamp-1">{event.title}</li>
        </ol>
      </nav>

      {/* Cover */}
      <div className="relative h-56 sm:h-80 w-full overflow-hidden border border-border bg-neutral-100">
        {event.cover_image_key ? (
          <Image
            src={event.cover_image_key}
            alt={event.title}
            fill
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-muted to-accent/20">
            <svg className="h-16 w-16 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-neutral-900/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur">
          {isPast ? 'past' : 'upcoming'}
        </span>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {departmentLabels(event.departments).map((label) => (
              <span
                key={label}
                className={`clip-cut cut-xs border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${DEPT_BADGE[label] ?? DEPT_BADGE.NUSCAS}`}
              >
                {label === 'Joint' ? 'Joint Department' : label}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-foreground">
            {event.title}
          </h1>

          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border/80 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent/10 text-accent">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">Date</div>
                <time dateTime={event.starts_at} className="mt-0.5 block text-sm font-bold text-foreground">
                  {dateStr}
                </time>
                <div className="mt-0.5 text-xs text-text-muted">{timeStr}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent/10 text-accent">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">Location</div>
                <div className="mt-0.5 text-sm font-bold text-foreground">
                  {event.location || 'Online / Discord'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {event.description && (
          <section>
            <h2 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-text-muted">
              About the event
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground sm:text-base">
              {event.description}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">Gallery</h2>
              <p className="mt-1 text-xs text-text-muted">
                Photos from the activity uploaded by committee members and attendees.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative h-48 overflow-hidden border border-border bg-neutral-100 shadow-sm"
                >
                  <Image
                    src={photo.storage_key}
                    alt={photo.alt_text || `Photo from ${event.title}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-border pt-8">
          <Link
            href="/events"
            className="clip-cut cut-md inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            See all events
          </Link>
        </div>
      </div>
    </article>
  )
}

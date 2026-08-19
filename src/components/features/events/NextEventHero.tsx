import Link from 'next/link'
import Image from 'next/image'
import type { ClubEvent } from '@/lib/events'
import { eventPreviewText } from '@/lib/eventText'
import { formatInClubTime, clubCalendarDaysUntil } from '@/lib/datetime'
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon'
import NextEventHeroActions from './NextEventHeroActions'

interface NextEventHeroProps {
  /** Chosen by getHeroEvent() so the grid below can exclude the same event. */
  event: ClubEvent | null
  isUpcoming: boolean
  className?: string
}

// Matches the tinted badges used on EventCard so the hero doesn't invent a
// second visual language for departments.
const DEPT_BADGE: Record<string, string> = {
  NUSCAS: 'bg-violet-500/25 text-violet-100 border-violet-300/40',
  Joint: 'bg-amber-500/25 text-amber-100 border-amber-300/40',
  CASuals: 'bg-sky-500/25 text-sky-100 border-sky-300/40',
  TOPICS: 'bg-emerald-500/25 text-emerald-100 border-emerald-300/40',
  Palette: 'bg-pink-500/25 text-pink-100 border-pink-300/40',
}

function departmentLabels(departments: string[]): string[] {
  if (!departments || departments.length === 0) return ['NUSCAS']
  if (departments.length === 3) return ['Joint']
  return departments
}

// "Joint" is a rollup label, not a real department name.
function badgeText(label: string): string {
  return label === 'Joint' ? 'Joint Department' : label
}

/**
 * Homepage hero. Leads with whatever is happening next so a new member sees a
 * date and a place before anything else; falls back to the most recent past
 * event (and then to a plain invitation) when nothing is on the calendar.
 */
export default function NextEventHero({ event, isUpcoming, className = '' }: NextEventHeroProps) {
  if (!event) {
    return (
      <div className={`angle-frame clip-cut cut-xl relative flex flex-col justify-end bg-neutral-950 text-white p-8 sm:p-12 ${className}`}>
        <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent">
          NUSCAS
        </span>
        <p className="mt-4 text-3xl sm:text-4xl font-sans font-black leading-tight">
          Our next semester is being planned right now
        </p>
        <p className="mt-3 max-w-lg text-sm text-white/70 leading-relaxed">
          Screenings, workshops, and socials go up here as soon as they&apos;re
          confirmed. In the meantime, take a look at what we ran last semester.
        </p>
        <Link
          href="/events"
          className="clip-cut cut-md mt-8 inline-flex w-fit items-center gap-2 bg-accent px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Browse past events
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  const dateStr = formatInClubTime(event.starts_at, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeStr = formatInClubTime(event.starts_at, {
    hour: '2-digit',
    minute: '2-digit',
  })

  const preview = eventPreviewText(event.description, { maxWords: 26, maxBlocks: 2 })

  // Whole-day difference, so an event later today reads "Today" rather than
  // rounding to 0 or 1 depending on the hour.
  const daysAway = clubCalendarDaysUntil(event.starts_at)

  let countdown: string | null = null
  if (isUpcoming) {
    if (daysAway <= 0) countdown = 'Today'
    else if (daysAway === 1) countdown = 'Tomorrow'
    else if (daysAway <= 14) countdown = `In ${daysAway} days`
  }

  return (
    <div className={`angle-frame clip-cut cut-xl group relative overflow-hidden bg-neutral-950 text-white ${className}`}>
      {/* Cover bleeds behind the whole panel, same treatment as the featured
          card in the events grid. */}
      <div className="absolute inset-0">
        {event.cover_image_key ? (
          <Image
            src={event.cover_image_key}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/40 via-neutral-900 to-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/20" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-10">
        {/* Eyebrow: what this slot is, plus how soon it lands */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="clip-cut cut-xs inline-flex items-center gap-1.5 bg-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {isUpcoming ? 'Next up' : 'Most recent'}
          </span>
          {countdown && (
            <span className="clip-cut cut-xs bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur">
              {countdown}
            </span>
          )}
          {departmentLabels(event.departments).map((label) => (
            <span
              key={label}
              className={`clip-cut cut-xs border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${DEPT_BADGE[label] ?? DEPT_BADGE.NUSCAS}`}
            >
              {badgeText(label)}
            </span>
          ))}
        </div>

        <p className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-sans font-black leading-[1.05] tracking-tight line-clamp-3">
          {event.title}
        </p>

        {/* `whitespace-pre-line` keeps the paragraph breaks authors typed; the
            preview helper caps the length so a long write-up can't push the
            date and buttons out of the panel. */}
        {preview && (
          <div className="mt-4 hidden max-w-2xl sm:block">
            <p className="whitespace-pre-line text-sm text-white/75 leading-relaxed">
              {preview}
            </p>
          </div>
        )}

        {/* Date and place carry the most weight for someone deciding whether to
            turn up, so they get their own row above the fold. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-white/90">
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={event.starts_at}>{dateStr} &middot; {timeStr}</time>
          </span>
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{event.location || 'Online'}</span>
          </span>
        </div>

        <NextEventHeroActions slug={event.slug} />
      </div>
    </div>
  )
}

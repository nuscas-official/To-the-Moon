/**
 * The club runs in Singapore, so every event time is shown in SGT regardless
 * of where it's rendered.
 *
 * Passing only a locale ('en-SG') sets the formatting style but NOT the
 * timezone — that falls back to the runtime's. Locally that's SGT, but Vercel
 * runs UTC, so a server-rendered 10:30am event printed as 02:30am. Client
 * components got it "right" only by accident, via the viewer's own clock,
 * which is itself wrong for anyone outside Singapore and causes a hydration
 * mismatch against the server HTML.
 *
 * Always format event timestamps through here.
 */
export const CLUB_TIME_ZONE = 'Asia/Singapore'

/**
 * Formats an instant in club time. Pass whichever Intl fields you need —
 * date-only options yield a date, time-only options yield a time.
 */
export function formatInClubTime(
  value: string | Date,
  options: Intl.DateTimeFormatOptions
): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('en-SG', { ...options, timeZone: CLUB_TIME_ZONE })
}

/** YYYY-MM-DD for the calendar day this instant falls on in club time. */
function clubDateKey(date: Date): string {
  // en-CA renders ISO-ordered dates, so this is directly comparable.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Whole calendar days from now until `value`, counted in club time so an
 * evening event doesn't read as "tomorrow" just because the server is on UTC.
 * Negative once the day has passed.
 */
export function clubCalendarDaysUntil(value: string | Date, now: Date = new Date()): number {
  const target = typeof value === 'string' ? new Date(value) : value
  const from = Date.parse(`${clubDateKey(now)}T00:00:00Z`)
  const to = Date.parse(`${clubDateKey(target)}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}

/** True when both instants fall on the same calendar day in club time. */
export function isSameClubDay(a: string | Date, b: string | Date): boolean {
  const dateA = typeof a === 'string' ? new Date(a) : a
  const dateB = typeof b === 'string' ? new Date(b) : b
  return clubDateKey(dateA) === clubDateKey(dateB)
}

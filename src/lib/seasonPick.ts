import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Anime of the Season: members nominate and vote through the Telegram bot
 * (see src/lib/bot.ts). Seasons follow the anime broadcast calendar —
 * Winter Jan–Mar, Spring Apr–Jun, Summer Jul–Sep, Fall Oct–Dec — in
 * Singapore time, and votes reset when the season rolls over.
 */
const SEASONS = ['winter', 'spring', 'summer', 'fall'] as const

export interface Season {
  /** Stored in season_nominations.season, e.g. "2026-fall". */
  key: string
  /** Human label, e.g. "Fall 2026". */
  label: string
}

export function getCurrentSeason(now: Date = new Date()): Season {
  const parts = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(now)
  const year = Number(parts.find(p => p.type === 'year')?.value)
  const month = Number(parts.find(p => p.type === 'month')?.value)
  const season = SEASONS[Math.floor((month - 1) / 3)]
  return {
    key: `${year}-${season}`,
    label: `${season.charAt(0).toUpperCase()}${season.slice(1)} ${year}`,
  }
}

export interface SeasonNominee {
  id: string
  anilist_id: number
  title: string
  image_url: string | null
  accent_hex: string | null
  votes: number
}

/**
 * Nominees for a season, most votes first. Ties go to whichever title was
 * nominated earliest, so the hero doesn't flip back and forth.
 */
export async function getSeasonStandings(seasonKey: string): Promise<SeasonNominee[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('season_nominations')
    .select('id, anilist_id, title, image_url, accent_hex, created_at, season_votes(count)')
    .eq('season', seasonKey)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || [])
    .map(row => ({
      id: row.id as string,
      anilist_id: row.anilist_id as number,
      title: row.title as string,
      image_url: row.image_url as string | null,
      accent_hex: row.accent_hex as string | null,
      votes: (row.season_votes as unknown as { count: number }[])?.[0]?.count ?? 0,
    }))
    // Array.prototype.sort is stable, so equal counts keep nomination order.
    .sort((a, b) => b.votes - a.votes)
}

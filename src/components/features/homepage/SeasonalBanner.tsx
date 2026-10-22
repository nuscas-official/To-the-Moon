import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentSeason, getSeasonStandings } from '@/lib/seasonPick'
import Image from 'next/image'

interface SeasonalPick {
  title: string;
  accent_hex: string;
  image_url: string;
  description?: string;
  type?: string;
  votes?: number;
}

const FALLBACK_PICK: SeasonalPick = {
  title: "Sousou no Frieren",
  accent_hex: "#c82333",
  image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
  description: "An elf mage and her former party members' journey. A story about time, legacy, and human connection.",
  type: "Featured Anime"
}

interface SeasonalBannerProps {
  className?: string
}

/**
 * Hero card for the Anime of the Season. Shows the title members voted for
 * via the Telegram bot (/nominate, /vote), unless a committee member pinned a
 * manual pick in Admin → Settings. The manual pick is also the fallback
 * before anyone has voted this season.
 */
export default async function SeasonalBanner({ className = "aspect-video" }: SeasonalBannerProps) {
  let seasonalPick = FALLBACK_PICK
  let pinned = false

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'seasonal_pick')
      .single()

    if (!error && data?.value) {
      const val = data.value as unknown as Partial<SeasonalPick> & { pinned?: boolean }
      pinned = val.pinned === true
      seasonalPick = {
        title: val.title || FALLBACK_PICK.title,
        accent_hex: val.accent_hex || FALLBACK_PICK.accent_hex,
        image_url: val.image_url || FALLBACK_PICK.image_url,
        description: val.description || (val.title ? undefined : FALLBACK_PICK.description),
        type: val.type || "Seasonal Pick"
      }
    }
  } catch (err) {
    console.error("Failed to fetch seasonal pick config, using fallback:", err)
  }

  if (!pinned) {
    try {
      const season = getCurrentSeason()
      const [leader] = await getSeasonStandings(season.key)
      if (leader && leader.votes > 0 && leader.image_url) {
        seasonalPick = {
          title: leader.title,
          accent_hex: leader.accent_hex || seasonalPick.accent_hex,
          image_url: leader.image_url,
          type: `Anime of the Season · ${season.label}`,
          votes: leader.votes
        }
      }
    } catch (err) {
      console.error("Failed to fetch season vote standings, using configured pick:", err)
    }
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  const voteUrl = botUsername ? `https://t.me/${botUsername}` : null

  // Define accent styles to override --color-accent for this component block
  const componentStyles = {
    '--color-accent': seasonalPick.accent_hex,
  } as React.CSSProperties

  const cardClassName = `clip-cut cut-lg relative w-full overflow-hidden border border-border shadow-xl group flex items-end animate-fade-in hover:border-accent/40 hover:shadow-md transition-all duration-300 ${className}`

  const content = (
    <>
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-105">
        <Image 
          src={seasonalPick.image_url} 
          alt={seasonalPick.title}
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
        {/* Subtle dark overlay for text legibility in mini view */}
        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition-colors duration-300" />
      </div>

      {/* Content Section */}
      <div className="relative z-20 p-4 sm:p-5 text-left w-full">
        {/* Badge */}
        <div className="clip-cut cut-xs inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur mb-1 bg-black/25">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          {seasonalPick.type}
        </div>

        {/* Title */}
        <p className="text-lg sm:text-xl font-display text-white leading-snug tracking-tight">
          {seasonalPick.title}
        </p>

        {/* Action Link */}
        {voteUrl && (
          <div className="mt-2 text-[10px] font-mono text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 flex items-center gap-1">
            <span>
              {seasonalPick.votes
                ? `${seasonalPick.votes} vote${seasonalPick.votes === 1 ? '' : 's'} · Vote on Telegram`
                : 'Vote on Telegram'}
            </span>
            <svg className="w-3 h-3 text-white/80 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Aesthetic Border Highlight */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-accent/60 to-accent" />
    </>
  )

  if (!voteUrl) {
    return (
      <div style={componentStyles} className={cardClassName}>
        {content}
      </div>
    )
  }

  return (
    <a
      href={voteUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={componentStyles}
      className={cardClassName}
    >
      {content}
    </a>
  )
}

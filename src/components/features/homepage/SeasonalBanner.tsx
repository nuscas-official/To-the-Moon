import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'

interface SeasonalPick {
  title: string;
  accent_hex: string;
  image_url: string;
  description?: string;
  type?: string;
}

const FALLBACK_PICK: SeasonalPick = {
  title: "Sousou no Frieren",
  accent_hex: "#a855f7",
  image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
  description: "An elf mage and her former party members' journey. A story about time, legacy, and human connection.",
  type: "Featured Anime"
}

interface SeasonalBannerProps {
  className?: string
  isMini?: boolean
}

export default async function SeasonalBanner({ className = "aspect-video", isMini = false }: SeasonalBannerProps) {
  let seasonalPick = FALLBACK_PICK

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'seasonal_pick')
      .single()

    if (!error && data?.value) {
      const val = data.value as unknown as Partial<SeasonalPick>
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

  // Define accent styles to override --color-accent for this component block
  const componentStyles = {
    '--color-accent': seasonalPick.accent_hex,
  } as React.CSSProperties

  if (isMini) {
    return (
      <Link
        href="/ratings"
        style={componentStyles}
        className={`relative w-full overflow-hidden border border-border shadow-xl group flex items-end animate-fade-in hover:border-accent/40 hover:shadow-md transition-all duration-300 ${className}`}
      >
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
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur mb-1 bg-black/25 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {seasonalPick.type}
          </div>

          {/* Title */}
          <p className="text-lg sm:text-xl font-display text-white leading-snug tracking-tight font-black">
            {seasonalPick.title}
          </p>

          {/* Action Link */}
          <div className="mt-2 text-[10px] font-mono text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 flex items-center gap-1">
            <span>View Ratings</span>
            <svg className="w-3 h-3 text-white/80 group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Aesthetic Border Highlight */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-accent/60 to-accent" />
      </Link>
    )
  }

  return (
    <section 
      style={componentStyles}
      className={`relative w-full overflow-hidden border border-border shadow-xl group flex items-end animate-fade-in ${className}`}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={seasonalPick.image_url} 
          alt={seasonalPick.title}
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
      </div>

      {/* Content Section */}
      <div className="relative z-20 p-5 sm:p-10 lg:p-12 max-w-xl text-left w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur mb-1.5 sm:mb-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {seasonalPick.type}
        </div>

        {/* Title */}
        <p className="md:text-7xl text-4xl font-display text-white leading-tight tracking-tight">
          {seasonalPick.title}
        </p>

        {/* Description */}
        {seasonalPick.description && (
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-neutral-200 drop-shadow max-w-xl font-medium leading-relaxed">
            {seasonalPick.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-2 sm:mt-4 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="/ratings"
            className="px-2 py-2 sm:px-4 sm:py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur border border-white/20 active:scale-95 transition-all"
          >
            See Club Ratings
          </Link>
        </div>
      </div>

      {/* Aesthetic Border Highlight */}
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-accent via-accent/60 to-accent" />
    </section>
  )
}

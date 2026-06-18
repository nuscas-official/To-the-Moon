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

export default async function SeasonalBanner() {
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

  return (
    <section 
      style={componentStyles}
      className="relative w-full aspect-video overflow-hidden border border-border shadow-xl group flex items-end animate-fade-in"
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 backdrop-blur mb-3 sm:mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {seasonalPick.type}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
          {seasonalPick.title}
        </h1>

        {/* Description */}
        {seasonalPick.description && (
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-neutral-200 drop-shadow max-w-xl font-medium leading-relaxed">
            {seasonalPick.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="/ratings"
            className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur border border-white/20 active:scale-95 transition-all"
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

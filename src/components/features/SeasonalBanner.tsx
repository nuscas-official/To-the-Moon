import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'

interface SeasonalPick {
  title: string;
  accent_hex: string;
  image_url: string;
  description?: string;
  link?: string;
  type?: string;
}

const FALLBACK_PICK: SeasonalPick = {
  title: "Sousou no Frieren",
  accent_hex: "#a855f7",
  image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
  description: "An elf mage and her former party members' journey. A story about time, legacy, and human connection.",
  link: "https://anilist.co/anime/154587/Sousou-no-Frieren/",
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
      // Cast config value
      const val = data.value as unknown as Partial<SeasonalPick>
      seasonalPick = {
        title: val.title || FALLBACK_PICK.title,
        accent_hex: val.accent_hex || FALLBACK_PICK.accent_hex,
        image_url: val.image_url || FALLBACK_PICK.image_url,
        description: val.description || (val.title ? undefined : FALLBACK_PICK.description),
        link: val.link || (val.title ? undefined : FALLBACK_PICK.link),
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
      className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-border shadow-xl bg-neutral-900 group min-h-[400px] md:min-h-[500px] flex items-end animate-fade-in"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={seasonalPick.image_url} 
          alt={seasonalPick.title}
          fill
          unoptimized
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[6000ms] ease-out opacity-60 group-hover:opacity-75"
        />
        {/* Dark Editorial Vignette / Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/20 to-transparent z-10 hidden md:block" />
      </div>

      {/* Content Section */}
      <div className="relative z-20 p-6 sm:p-10 lg:p-12 max-w-2xl text-left w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20 bg-neutral-950/50 backdrop-blur mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {seasonalPick.type}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
          {seasonalPick.title}
        </h1>

        {/* Description */}
        {seasonalPick.description && (
          <p className="mt-4 text-base sm:text-lg text-neutral-200 drop-shadow max-w-xl font-medium leading-relaxed">
            {seasonalPick.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          {seasonalPick.link && (
            <Link 
              href={seasonalPick.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95 transition-all flex items-center gap-2 border border-accent"
            >
              <span>Explore on AniList</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
          <Link
            href="/ratings"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur border border-white/20 active:scale-95 transition-all"
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

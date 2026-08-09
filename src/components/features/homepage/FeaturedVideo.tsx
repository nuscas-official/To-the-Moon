'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, ArrowUpRight } from 'lucide-react'

interface FeaturedVideoProps {
  /** YouTube video id — the `v=` value from the watch URL. */
  videoId: string
  /** Card title, also the accessible name for the player. */
  title: string
  blurb?: string
  /** Small pill above the title. */
  badge?: string
  className?: string
}

/**
 * A featured YouTube embed, rendered as a facade: until someone actually
 * presses play we show only the poster frame, and the iframe (≈1MB of YouTube
 * script, plus its cookies) is never requested. Clicking swaps in the real
 * player on the privacy-preserving youtube-nocookie.com origin — which has to
 * be allowed by `frame-src` in the CSP at next.config.mjs.
 *
 * Sized to sit beside PageStrip in the Old Stories section, so it borrows that
 * card's border weight and colour: the 16:9 player is fixed and the caption
 * block below it takes up whatever height is left.
 */
export default function FeaturedVideo({
  videoId,
  title,
  blurb,
  className = '',
}: FeaturedVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  // maxresdefault is the only 16:9 thumbnail, but YouTube doesn't generate it
  // for every upload; hqdefault always exists, so fall back to it on error.
  const [thumbnail, setThumbnail] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  )

  return (
    <div
      className={`theme-crimson relative flex w-full flex-col overflow-hidden border border-neutral-800 bg-background-dark text-text-dark [--color-border:var(--color-border-dark)] [--color-foreground:var(--color-text-dark)] [--color-text-muted:var(--color-text-muted-dark)] ${className}`}
    >
      <div className="relative aspect-video w-full flex-none bg-black">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          >
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              onError={() => setThumbnail(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />

            {/* Legibility wash, lifted on hover like the seasonal banner */}
            <span className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/25" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="clip-cut cut-md inline-flex items-center gap-2.5 bg-accent px-6 py-3 text-white transition-transform duration-300 group-hover:scale-[1.06]">
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Play</span>
              </span>
            </span>

            <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent via-accent/60 to-accent" />
          </button>
        )}
      </div>

      {/* Caption block — absorbs the height difference against the timeline */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div>
          <h3 className="font-serif text-2xl leading-snug tracking-tight text-foreground">
            {title}
          </h3>
          {blurb && (
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{blurb}</p>
          )}
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 self-start text-xs font-extrabold uppercase tracking-wider text-accent transition-colors hover:text-accent/80"
        >
          Watch on YouTube
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  )
}

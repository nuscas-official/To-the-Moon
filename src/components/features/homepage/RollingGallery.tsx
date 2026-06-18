'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArtworkCard from '@/components/features/gallery/ArtworkCard'

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

interface Artwork {
  id: string
  storage_key: string
  title: string | null
  artist_credit: string
}

interface RollingGalleryProps {
  artworks: Artwork[]
}

export default function RollingGallery({ artworks }: RollingGalleryProps) {
  const [isMarqueePaused, setIsMarqueePaused] = useState(false)

  if (!artworks || artworks.length === 0) {
    return null
  }

  // To ensure a seamless infinite scroll loop, the marquee track must have identical halves.
  // We repeat the artworks array an even number of times so that the first 50% matches the last 50% exactly.
  const repeatedArtworks: Artwork[] = []
  let repeatCount = Math.ceil(16 / artworks.length)
  if (repeatCount % 2 !== 0) {
    repeatCount += 1
  }
  repeatCount = Math.max(2, repeatCount)

  for (let i = 0; i < repeatCount; i++) {
    repeatedArtworks.push(...artworks)
  }

  return (
    <section className="w-full py-16 border-t border-border/60 relative overflow-hidden bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-accent">
            Member Art Showcase
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-text tracking-tight mt-1">
            Club Art Gallery
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-xl leading-relaxed">
            A continuous loop of amazing fanart, sketches, and digital illustrations crafted by the talented members of our community.
          </p>
        </div>
        <Link
          href="/gallery"
          className="group inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors self-start sm:self-end"
        >
          Explore Full Gallery
          <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Marquee Track Container */}
      <div className="relative w-full overflow-hidden py-4 select-none">
        {/* Soft fading edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling Strip */}
        <div className="flex w-max relative">
          <div 
            className="animate-marquee flex gap-6 px-3"
            style={{
              animationPlayState: isMarqueePaused ? 'paused' : 'running'
            }}
          >
            {repeatedArtworks.map((art, idx) => (
              <ArtworkCard
                key={`${art.id}-${idx}`}
                artwork={art}
                variant="marquee"
                onZoomToggle={setIsMarqueePaused}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ArtworkCard from '@/components/features/gallery/ArtworkCard'
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!artworks || artworks.length === 0) {
    return null
  }

  // Mobile limit: 10 items; Desktop limit: 15 items
  const displayedArtworks = isMobile ? artworks.slice(0, 10) : artworks.slice(0, 15)

  // Helper to calculate duplication for smooth infinite scrolling
  const getRepeatedArtworks = (items: Artwork[]) => {
    if (items.length === 0) return []
    const repeated: Artwork[] = []
    let repeatCount = Math.ceil(16 / items.length)
    if (repeatCount % 2 !== 0) {
      repeatCount += 1
    }
    repeatCount = Math.max(2, repeatCount)

    for (let i = 0; i < repeatCount; i++) {
      repeated.push(...items)
    }
    return repeated
  }

  // Splitting items into two distinct arrays so both rows feature different pieces
  const half = Math.ceil(displayedArtworks.length / 2)
  const firstRowArtworks = displayedArtworks.slice(0, half)
  const secondRowArtworks = displayedArtworks.slice(half)

  // Fallback if odd item count makes second row too sparse to loop smoothly
  const row1Items = getRepeatedArtworks(firstRowArtworks)
  const row2Items = getRepeatedArtworks(secondRowArtworks.length > 0 ? secondRowArtworks : firstRowArtworks)

  return (
    <section className="w-full py-16 relative overflow-hidden bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xl font-display tracking-widest text-accent">
            Member Palette
          </span>
          <p className="text-4xl md:text-5xl font-serif text-text tracking-tight py-2">
            Art Gallery
          </p>
          <p className="text-sm text-text-muted mt-2 max-w-xl font-sans leading-relaxed">
            A collection of amazing fanart, sketches, and digital illustrations crafted by the talented members of our community.
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
      <div className="relative w-full overflow-hidden py-4 select-none flex flex-col gap-6">
        {/* Soft fading edges layer across both rows */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: Forward Direction */}
        <div className="flex w-max relative">
          <div 
            className="animate-marquee flex gap-6 px-3"
            style={{
              animationPlayState: isMarqueePaused ? 'paused' : 'running'
            }}
          >
            {row1Items.map((art, idx) => (
              <ArtworkCard
                key={`r1-${art.id}-${idx}`}
                artwork={art}
                variant="marquee"
                onZoomToggle={setIsMarqueePaused}
              />
            ))}
          </div>
        </div>

        {/* Row 2: Reverse Direction */}
        <div className="flex w-max relative">
          <div 
            className="animate-marquee flex gap-6 px-3"
            style={{
              animationPlayState: isMarqueePaused ? 'paused' : 'running',
              animationDirection: 'reverse'
            }}
          >
            {row2Items.map((art, idx) => (
              <ArtworkCard
                key={`r2-${art.id}-${idx}`}
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
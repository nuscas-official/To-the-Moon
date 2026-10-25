'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HalloweenLocation } from '@/lib/halloweenLocations'

/**
 * Location picker for the /halloween page. A large stage shows the selected
 * location; a scrollable strip of thumbnails below it (with arrows, swipe and
 * arrow-key support) changes the selection.
 */
export default function LocationsCarousel({ locations }: { locations: HalloweenLocation[] }) {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const stripRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const location = locations[active]

  const select = (index: number) => setActive(Math.min(Math.max(index, 0), locations.length - 1))

  // Keep the selected thumbnail centred in the strip without scrolling the page.
  useEffect(() => {
    const strip = stripRef.current
    const thumb = thumbRefs.current[active]
    if (!strip || !thumb) return
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2
    strip.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }, [active, reduce])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      select(active + 1)
      thumbRefs.current[Math.min(active + 1, locations.length - 1)]?.focus({ preventScroll: true })
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      select(active - 1)
      thumbRefs.current[Math.max(active - 1, 0)]?.focus({ preventScroll: true })
    }
  }

  return (
    <section aria-label="Locations" className="py-20 lg:py-28">
      <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-accent-gold">The City of Monad</p>
      <p className="mt-4 text-center font-display text-5xl leading-none sm:text-6xl">Locations</p>

      {/* Stage */}
      <div className="relative mx-auto mt-10 aspect-[4/5] w-full overflow-hidden lg:w-[70%] rounded-2xl bg-[#0b0910] ring-1 ring-white/15 sm:aspect-[16/10]">
        <AnimatePresence initial={false}>
          <motion.div
            key={location.id}
            initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Backdrop location={location} index={active} />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block bg-accent-gold/90 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-black">
                {location.type}
              </span>
              <p className="mt-3 max-w-2xl font-display text-4xl leading-[0.95] text-white sm:text-6xl">
                {location.name}
              </p>
              {location.description && (
                <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/80 sm:text-sm">
                  {location.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="relative mt-4 flex items-center gap-2">
        <ArrowButton direction="prev" disabled={active === 0} onClick={() => select(active - 1)} />

        <div
          ref={stripRef}
          role="tablist"
          aria-label="Choose a location"
          onKeyDown={onKeyDown}
          className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {locations.map((loc, i) => {
            const selected = i === active
            return (
              <button
                key={loc.id}
                ref={(el) => {
                  thumbRefs.current[i] = el
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className={`group w-28 shrink-0 snap-center overflow-hidden rounded-lg text-left ring-1 transition sm:w-36 ${
                  selected ? 'bg-white ring-2 ring-accent-gold' : 'bg-black/40 ring-white/15 hover:ring-white/50'
                }`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Thumb location={loc} index={i} dim={!selected} />
                </div>
                <span
                  className={`block truncate px-2 py-1.5 text-center text-[11px] font-semibold sm:text-xs ${
                    selected ? 'text-black' : 'text-white/80'
                  }`}
                >
                  {loc.type}
                </span>
              </button>
            )
          })}
        </div>

        <ArrowButton direction="next" disabled={active === locations.length - 1} onClick={() => select(active + 1)} />
      </div>
    </section>
  )
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous location' : 'Next location'}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

/** Each placeholder gets its own hue so switching locations is visible before the art exists. */
function placeholderStyle(index: number) {
  const hue = (index * 47 + 270) % 360
  return {
    backgroundImage: `radial-gradient(circle at 30% 20%, hsl(${hue} 45% 28%), transparent 60%), linear-gradient(160deg, hsl(${hue} 35% 14%), #0b0910)`,
  }
}

function Backdrop({ location, index }: { location: HalloweenLocation; index: number }) {
  if (location.image) {
    return (
      <Image
        src={location.image}
        alt={location.name}
        fill
        sizes="(min-width: 1152px) 1100px, 100vw"
        className="object-cover"
      />
    )
  }
  return <div aria-hidden="true" className="h-full w-full" style={placeholderStyle(index)} />
}

function Thumb({ location, index, dim }: { location: HalloweenLocation; index: number; dim: boolean }) {
  const src = location.thumb ?? location.image
  return (
    <>
      {src ? (
        <Image src={src} alt="" fill sizes="144px" className="object-cover" />
      ) : (
        <div aria-hidden="true" className="h-full w-full" style={placeholderStyle(index)} />
      )}
      {!src && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-display text-4xl text-white/60"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      {dim && <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:opacity-0" />}
    </>
  )
}

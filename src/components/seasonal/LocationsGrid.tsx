'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { HalloweenLocation } from '@/lib/halloweenLocations'

// Same rise-in as the scroll story chapters.
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

/**
 * Location cards for the /halloween page. Each card opens a lightbox with the
 * large image and description; the buttons or arrow keys move between
 * locations, and Escape closes.
 */
export default function LocationsGrid({ locations }: { locations: HalloweenLocation[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  const close = useCallback(() => {
    setOpen(null)
    lastTrigger.current?.focus()
  }, [])

  return (
    <section aria-label="Locations" className="py-20 lg:py-28">
      <motion.div
        initial={reduce ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ amount: 0.5, once: true }}
        variants={stagger}
      >
        <motion.p variants={fadeUp} className="text-center text-xs font-bold uppercase tracking-[0.35em] text-accent-gold">
          The City of Monad
        </motion.p>
        <motion.p variants={fadeUp} className="mt-4 text-center font-display text-5xl leading-none sm:text-6xl">
          Locations
        </motion.p>
      </motion.div>

      <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
        {locations.map((loc, i) => (
          <motion.li
            key={loc.id}
            initial={reduce ? false : { opacity: 0, y: 50, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget
                setOpen(i)
              }}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-black/40 text-left ring-1 ring-white/15 transition hover:-translate-y-1 hover:ring-accent-gold"
            >
              <Picture
                location={loc}
                index={i}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">{loc.type}</p>
                <p className="mt-1 truncate font-semibold leading-snug text-white">{loc.name}</p>
              </div>
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && (
          <Lightbox locations={locations} index={open} onIndex={setOpen} onClose={close} />
        )}
      </AnimatePresence>
    </section>
  )
}

function Lightbox({
  locations,
  index,
  onIndex,
  onClose,
}: {
  locations: HalloweenLocation[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const loc = locations[index]
  const hasPrev = index > 0
  const hasNext = index < locations.length - 1

  // Lock page scroll, and move focus into the dialog.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && hasPrev) onIndex(index - 1)
      else if (e.key === 'ArrowRight' && hasNext) onIndex(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext, onIndex, onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={loc.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl bg-[#14101c] ring-1 ring-white/15 md:flex-row md:overflow-hidden"
      >
        {loc.image ? (
          // Original file at its own proportions: no cropping and no re-compression.
          <div className="flex shrink-0 items-center justify-center bg-black md:w-1/2">
            <Image
              src={loc.image}
              alt={loc.name}
              width={0}
              height={0}
              sizes="100vw"
              unoptimized
              priority
              className="h-auto max-h-[90vh] w-full object-contain"
            />
          </div>
        ) : (
          <div className="relative aspect-[4/3] w-full shrink-0 md:aspect-auto md:min-h-[28rem] md:w-1/2">
            <Picture location={loc} index={index} sizes="(min-width: 768px) 440px, 100vw" />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 sm:p-8 md:overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-gold">{loc.type}</p>
          <p className="mt-3 font-display text-4xl leading-[0.95] text-white sm:text-5xl">{loc.name}</p>
          {loc.description && (
            <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">{loc.description}</p>
          )}

          <div className="mt-auto flex items-center justify-between pt-8">
            <span className="text-xs font-bold tracking-[0.2em] text-white/50">
              {String(index + 1).padStart(2, '0')} / {String(locations.length).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              <NavButton direction="prev" disabled={!hasPrev} onClick={() => onIndex(index - 1)} />
              <NavButton direction="next" disabled={!hasNext} onClick={() => onIndex(index + 1)} />
            </div>
          </div>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-accent"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </motion.div>
    </motion.div>
  )
}

function NavButton({
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-accent hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

/** Each placeholder gets its own hue so locations are distinguishable before the art exists. */
function placeholderStyle(index: number) {
  const hue = (index * 47 + 270) % 360
  return {
    backgroundImage: `radial-gradient(circle at 30% 20%, hsl(${hue} 45% 28%), transparent 60%), linear-gradient(160deg, hsl(${hue} 35% 14%), #0b0910)`,
  }
}

function Picture({
  location,
  index,
  sizes,
  className = '',
  priority,
}: {
  location: HalloweenLocation
  index: number
  sizes: string
  className?: string
  priority?: boolean
}) {
  const src = location.thumb ?? location.image
  if (src) {
    return (
      <Image
        src={src}
        alt={location.name}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    )
  }
  return (
    <div aria-hidden="true" className={`flex h-full w-full items-center justify-center ${className}`} style={placeholderStyle(index)}>
      <span className="font-display text-6xl text-white/40">{String(index + 1).padStart(2, '0')}</span>
    </div>
  )
}

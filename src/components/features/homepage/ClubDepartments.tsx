'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface Department {
  id: string
  name: string
  description: string
  imageSrc: string
  gallery: string[]
  highlights: string[]
}

const DEPARTMENTS: Department[] = [
  {
    id: 'casuals',
    name: 'CASuals',
    description: "Gaming Gauntlets, Cosplay, VTuber Concerts, Japan, Escape Room, Game Shows, Beyblade, Anime Awards, everything ACG-adjacent is under CASuals. With practically no restrictions, CASuals is where 'Wouldn't it be funny if...' becomes 'We're doing this.'",
    imageSrc: '/images/departments/anime-awards.webp',
    gallery: [
      '/images/departments/uma-musume.webp',
      '/images/departments/wig-styling.webp',
      '/images/departments/acg-gameshow.webp',
      '/images/departments/vtuber-concert.webp',
      '/images/departments/japan-trip-session.webp',
      '/images/departments/cosplay-photog.webp',
    ],
    highlights: ['Anisong Quiz', 'Japan Travel', 'VTuber Concerts', 'Gaming Gauntlet', 'Anime Awards', "Cosplay and Photography"],
  },
  {
    id: 'topics',
    name: 'TOPICS',
    description: "Explore the finer points of writing and storytelling through Media Analysis, Reviews and Fanfiction in NUSCAS' writing-focused department. Beyond writing, TOPICS is also responsible for running the NUSCAS Instagram and keeping the club's online presence alive. Also, look forward to the annual TOPICS D&D!",
    imageSrc: '/images/departments/topics-dnd.webp',
    gallery: [
      '/images/departments/localisation.webp',
      '/images/departments/dnd.webp',
      '/images/departments/narration.webp',
      '/images/departments/miyazaki.webp',
      '/images/departments/frieren.webp',
      '/images/departments/combat-rp.webp',
    ],
    highlights: ['Media Analysis', 'Reviews', 'Fanfiction', 'Roleplay', 'D&D', 'Instagram'],
  },
  {
    id: 'palette',
    name: 'Palette',
    description: "Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.",
    imageSrc: '/images/departments/anitan-anikun-art-corner.webp',
    gallery: [
      '/images/departments/otaket.webp',
      '/images/departments/fashion.webp',
      '/images/departments/character-design.webp',
      '/images/departments/zach-drawing.webp',
      '/images/departments/gijinka.webp',
      '/images/departments/eoy.webp',
    ],
    highlights: ['Character Design', 'Painting', 'Crochet', 'Gunpla', 'Boothing'],
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 15,
    },
  },
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export default function ClubDepartments() {
  // At most one department is "opened" (flipped to its canvas) at a time.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // True only while a flip is in flight. At rest we collapse the 3D context
  // (perspective / preserve-3d / backface) back to a flat layer so the settled
  // face renders as plain, un-composited text — otherwise Chrome keeps each
  // face on a GPU-rasterised 3D layer and the copy looks blurry, especially on
  // 1x-DPI screens and at fractional (flex-grown) widths.
  const [flipping, setFlipping] = useState(false)
  // Gated one frame after `flipping`: the 3D layer is mounted at the current
  // rotation with NO transition (so the mount is instant), then the transition
  // is switched on the next frame together with the new target rotation. Without
  // this split, the close flip's 180° mount delta gets animated on some mobile
  // browsers, producing a spurious spin. (Open's mount delta is 0°, so it only
  // ever showed on close.)
  const [flipTransition, setFlipTransition] = useState(false)
  const anySelected = selectedId !== null
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Height the opened card will occupy, reserved on the row up-front so that
  // opening a department grows the card into already-claimed space instead of
  // pushing the rest of the page down. The photos are flush squares whose size
  // (and therefore the mosaic's height) tracks the card width, so this has to be
  // derived from the live row width rather than hard-coded.
  const rowRef = useRef<HTMLDivElement>(null)
  const [reservedHeight, setReservedHeight] = useState<number>()

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 768px)')
    const measure = () => {
      // Only desktop lays the cards out side-by-side; the mobile stack reserves
      // nothing (each card flips in place).
      if (!mq.matches) {
        setReservedHeight(undefined)
        return
      }
      const CARD_GAP = 24 // md:gap-6 between the three cards
      const openW = (2.4 / 3.84) * (el.clientWidth - 2 * CARD_GAP) // opened card
      const PAD = 64 // canvas p-8, both sides
      const COL_GAP = 24 // md:gap-6 between copy and photos
      const photoW = (7 / 10) * (openW - PAD - COL_GAP) // photo column width
      const mosaicH = (2 * photoW) / 3 // two flush square rows
      const CHROME = 280 // header + chips + paddings + gaps (generous)
      setReservedHeight(Math.round(mosaicH + CHROME))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    mq.addEventListener('change', measure)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', measure)
    }
  }, [])

  // Drive a flip: mount the 3D layer at the current rotation first, then on the
  // next frame change the target so the rotateY transition actually animates,
  // then drop back to a flat layer once the animation has finished.
  const flipTo = (nextId: string | null) => {
    setFlipping(true) // mount the 3D layer at the current rotation, no transition
    setFlipTransition(false)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setFlipTransition(true) // now arm the transition…
        setSelectedId(nextId) // …and change the target so it animates
      })
    )
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      setFlipping(false)
      setFlipTransition(false)
    }, 720)
  }

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    flipTo(null)
  }

  // Clear any pending settle timer on unmount.
  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current)
    },
    []
  )

  // Listen to Escape key press to close department flipcard when open
  useEffect(() => {
    if (!selectedId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  return (
    <section className="w-full space-y-8 animate-fade-in">
      {/* Section Header */}
      <div className="text-left md:text-center space-y-2">
        <p className="font-display text-6xl  tracking-widest text-accent flex items-center md:justify-center gap-2">
          Our Departments
        </p>
      </div>

      {/* Mobile = stacked grid (flip in place). Desktop = flex row where the
          opened card grows horizontally and the others shrink aside. Using a
          grid on mobile keeps the flex-grow style below inert there. */}
      <motion.div
        ref={rowRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{ minHeight: reservedHeight }}
        className="grid grid-cols-1 gap-8 md:flex md:flex-row md:items-start md:gap-6"
      >
        {DEPARTMENTS.map((dept) => {
          const isSelected = selectedId === dept.id
          // Desktop widths: opened card takes the canvas, the rest tuck in.
          const grow = isSelected ? 2.4 : anySelected ? 0.72 : 1

          return (
            <motion.div
              key={dept.id}
              variants={cardVariants}
              style={{ flexGrow: grow, flexBasis: 0 }}
              className="min-w-0 transition-[flex-grow] duration-500 ease-out"
            >
              {/* Dim un-opened siblings (desktop only). The 3D depth
                  (perspective) only exists mid-flip; see `flipping`. */}
              <div
                className={[
                  'transition-opacity duration-500 ease-out',
                  anySelected && !isSelected ? 'md:opacity-40' : 'md:opacity-100',
                ].join(' ')}
                style={{ perspective: flipping ? 1600 : undefined }}
              >
                <div
                  style={{
                    transformStyle: flipping ? 'preserve-3d' : 'flat',
                    transform: flipping
                      ? isSelected
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)'
                      : 'none',
                  }}
                  className={[
                    // Closed cards keep the emblem height; the opened card grows
                    // to fit its content (flush square photos scale with width,
                    // so a fixed height would either clip them or leave a gap).
                    'relative h-[28rem] w-full',
                    isSelected ? 'md:h-auto' : 'md:h-[28rem]',
                    flipTransition
                      ? 'transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                      : '',
                  ].join(' ')}
                >
                  {/* ── FRONT: the sealed emblem ─────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => flipTo(dept.id)}
                    // Stop the click from focusing the button: a partially
                    // in-view control gets snapped fully into view on focus,
                    // which reads as an abrupt scroll jump. Keyboard focus (Tab)
                    // still works and is unaffected.
                    onMouseDown={(e) => e.preventDefault()}
                    aria-expanded={isSelected}
                    aria-label={`Open ${dept.name}`}
                    style={{
                      backfaceVisibility: flipping ? 'hidden' : 'visible',
                      WebkitBackfaceVisibility: flipping ? 'hidden' : 'visible',
                    }}
                    className={[
                      'group absolute inset-0 overflow-hidden',
                      'flex flex-col items-center justify-center p-8 text-center',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      // At rest, the opened card only shows its back face.
                      !flipping && isSelected ? 'hidden' : '',
                      isSelected ? 'pointer-events-none' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Emblem — fluid so it scales with the card instead of
                        being clipped when a sibling shrinks aside. */}
                    <div className="relative mb-5 aspect-square w-[80%] max-w-56 overflow-hidden rounded-full shadow-inner transition-transform duration-300 ease-out group-hover:scale-110">
                      <Image src={dept.imageSrc} alt={dept.name} fill unoptimized sizes="(min-width: 768px) 224px, 70vw" className="object-cover" />
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-black tracking-tight text-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:text-accent">
                      {dept.name}
                    </h3>

                    {/* Hover-reveal teaser — reserved space, only the opacity
                        changes so nothing shifts. Clamped to stay compact. */}
                    <div className="grid grid-rows-[1fr] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      <div className="min-h-0">
                        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-text-muted line-clamp-3">
                          {dept.description}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* ── BACK: the department canvas ──────────────────────── */}
                  <div
                    aria-hidden={!isSelected}
                    style={{
                      backfaceVisibility: flipping ? 'hidden' : 'visible',
                      WebkitBackfaceVisibility: flipping ? 'hidden' : 'visible',
                      // Only rotated while the 3D layer is live; flat at rest.
                      transform: flipping ? 'rotateY(180deg)' : 'none',
                    }}
                    className={[
                      'absolute inset-0 overflow-hidden bg-accent/5 p-6 md:p-8',
                      'flex flex-col shadow-[0_0_0_2px_var(--color-accent)]',
                      // When open on desktop, sit in-flow so this face's content
                      // gives the card its (auto) height instead of being pinned.
                      isSelected ? 'md:relative md:inset-auto' : '',
                      // At rest, un-opened cards only show their front face.
                      !flipping && !isSelected ? 'hidden' : '',
                      isSelected ? '' : 'pointer-events-none',
                    ].join(' ')}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight text-accent md:text-2xl">
                        {dept.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="hidden md:inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-medium text-text-muted hover:text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 rounded-lg shadow-sm transition-all active:scale-95 outline-none cursor-pointer"
                          title="Press Escape key to exit"
                          aria-label={`Exit ${dept.name} with Escape key`}
                        >
                          <kbd className="font-mono font-black text-[11px] uppercase tracking-wider">ESC</kbd>
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          aria-label={`Close ${dept.name}`}
                          className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    </div>

                    {/* Canvas — copy on the left; on the right the photo mosaic
                        with the highlight chips in a row beneath it. Collapses to
                        a single column on mobile (copy → photos → chips). */}
                    <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto md:flex-row md:gap-6 md:overflow-visible">
                      {/* Copy */}
                      <div className="md:flex-[3] md:min-h-0 md:overflow-y-auto">
                        <p className="text-left text-xs leading-relaxed text-text-muted md:text-sm">
                          {dept.description}
                        </p>
                      </div>

                      {/* Photos + highlight chips stacked beneath them. */}
                      <div className="flex flex-col gap-4 md:flex-[7]">
                        {/* Photo mosaic — flush square tiles (no gaps); 2 cols on
                            mobile, 3 cols on desktop. Tiles scale with width and
                            the card grows to fit them (see the h-auto above). */}
                        <div className="grid grid-cols-2 gap-0 overflow-hidden ring-1 ring-accent/40 md:grid-cols-3">
                          {dept.gallery.slice(0, 6).map((src, i) => (
                            <div key={i} className="relative aspect-square overflow-hidden">
                              <Image src={src} alt="" fill unoptimized sizes="(min-width: 768px) 200px, 45vw" className="object-cover" />
                            </div>
                          ))}
                        </div>

                        {/* Highlight chips — a wrapping row beneath the photos. */}
                        <div className="flex flex-wrap gap-2 md:shrink-0">
                          {dept.highlights.map((tag) => (
                            <span
                              key={tag}
                              className="whitespace-nowrap border border-accent/30 bg-background/60 px-2 py-1 text-xs text-text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

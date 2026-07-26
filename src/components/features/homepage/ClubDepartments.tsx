'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

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
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
    ],
    highlights: ['Media Analysis', 'Reviews', 'Fanfiction', 'Roleplay', 'D&D', 'Instagram'],
  },
  {
    id: 'palette',
    name: 'Palette',
    description: "Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.",
    imageSrc: '/images/departments/anitan-anikun-art-corner.webp',
    gallery: [
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
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

/* Shared face styling: both sides sit absolutely on top of each other and hide
   their own backface so the 3D flip only ever shows one at a time. */
const FACE_STYLE = {
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
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
  const anySelected = selectedId !== null

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setSelectedId(null)
  }

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
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 gap-8 md:flex md:flex-row md:items-stretch md:gap-6"
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
              {/* Dim un-opened siblings (desktop only) + provide the 3D depth. */}
              <div
                className={[
                  'transition-opacity duration-500 ease-out',
                  anySelected && !isSelected ? 'md:opacity-40' : 'md:opacity-100',
                ].join(' ')}
                style={{ perspective: 1600 }}
              >
                <div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isSelected ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                  className="relative h-[28rem] w-full transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[28rem]"
                >
                  {/* ── FRONT: the sealed emblem ─────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(dept.id)}
                    aria-expanded={isSelected}
                    aria-label={`Open ${dept.name}`}
                    style={FACE_STYLE}
                    className={[
                      'group absolute inset-0 overflow-hidden',
                      'flex flex-col items-center justify-center p-8 text-center',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
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
                    style={{ ...FACE_STYLE, transform: 'rotateY(180deg)' }}
                    className={[
                      'absolute inset-0 overflow-hidden bg-accent/5 p-6 md:p-8',
                      'flex flex-col shadow-[0_0_0_2px_var(--color-accent)]',
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

                    {/* Canvas — stacked on mobile, two-column on desktop.
                        Left holds the copy + tags; the right side is a 6-photo
                        mosaic that fills the canvas height on desktop. */}
                    <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto md:flex-row md:gap-8 md:overflow-hidden">
                      {/* Copy + highlight chips */}
                      <div className="flex flex-col gap-4 md:flex-[3] md:min-h-0 md:overflow-y-auto">
                        <p className="text-left text-xs leading-relaxed text-text-muted md:text-sm">
                          {dept.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dept.highlights.map((tag) => (
                            <span
                              key={tag}
                              className="border border-accent/30 bg-background/60 px-2 py-1 text-xs text-text-muted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Photo mosaic — 2 cols on mobile, 3×2 filling height on desktop */}
                      <div className="grid grid-cols-2 gap-2 md:flex-[7] md:min-h-0 md:grid-cols-3 md:grid-rows-2">
                        {dept.gallery.slice(0, 6).map((src, i) => (
                          <div key={i} className="relative aspect-square overflow-hidden ring-1 ring-accent/40 md:aspect-auto">
                            <Image src={src} alt="" fill unoptimized sizes="(min-width: 768px) 200px, 45vw" className="object-cover" />
                          </div>
                        ))}
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

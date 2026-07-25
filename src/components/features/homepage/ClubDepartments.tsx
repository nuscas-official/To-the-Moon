'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface Department {
  id: string
  name: string
  description: string
  imageSrc: string
  /* Revealed on the back face once a department is opened. Placeholder shots
     for now — real department photos drop straight into `gallery`. */
  gallery: string[]
  /* Short activity tags pulled from each department's own copy. */
  highlights: string[]
}

const DEPARTMENTS: Department[] = [
  {
    id: 'casuals',
    name: 'CASuals',
    description: "Gaming Gauntlets, Cosplay, Concert Watchalongs, Japan Tips, Escape Room, Game Shows, Beyblade, Anime Debates and the Anime Awards, everything ACG-adjacent is under CASuals. With practically no restrictions, CASuals is where 'Wouldn't it be funny if...' becomes 'We're doing this.'",
    imageSrc: '/images/silksong_placeholder.webp',
    gallery: [
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
    ],
    highlights: ['Anisong Quiz', 'Japan Travel', 'Anime Awards', 'Gaming Gauntlet', "Cosplay Makeup", "Wig Styling"],
  },
  {
    id: 'topics',
    name: 'TOPICS',
    description: "Explore the finer points of writing and storytelling through Media Analysis, Reviews and Fanfiction in NUSCAS' writing-focused department. Beyond writing, TOPICS is also responsible for running the NUSCAS Instagram and keeping the club's online presence alive. Also, look forward to the annual TOPICS D&D!",
    imageSrc: '/images/silksong_placeholder.webp',
    gallery: [
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
    ],
    highlights: ['Media Analysis', 'Reviews', 'Fanfiction', 'D&D', 'Instagram'],
  },
  {
    id: 'palette',
    name: 'Palette',
    description: "Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.",
    imageSrc: '/images/silksong_placeholder.webp',
    gallery: [
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
      '/images/silksong_placeholder.webp',
    ],
    highlights: ['Character Design', 'Crochet', 'Gunpla', 'Bookbinding'],
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
          const grow = isSelected ? 2.6 : anySelected ? 0.5 : 1

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
                  className="relative h-[28rem] w-full transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[24rem]"
                >
                  {/* ── FRONT: the sealed emblem ─────────────────────────── */}
                  <button
                    type="button"
                    onClick={() => setSelectedId(dept.id)}
                    aria-expanded={isSelected}
                    aria-label={`Open ${dept.name}`}
                    style={FACE_STYLE}
                    className={[
                      'group absolute inset-0 clip-cut cut-lg overflow-hidden',
                      'flex flex-col items-center justify-center p-8 text-center',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      isSelected ? 'pointer-events-none' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Emblem */}
                    <div className="clip-cut cut-xl relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden shadow-inner transition-transform duration-300 ease-out group-hover:scale-110">
                      <Image src={dept.imageSrc} alt={dept.name} width={128} height={128} className="object-cover" />
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
                      'absolute inset-0 clip-cut cut-lg overflow-hidden bg-accent/5 p-6 md:p-8',
                      'flex flex-col shadow-[0_0_0_2px_var(--color-accent)]',
                      isSelected ? '' : 'pointer-events-none',
                    ].join(' ')}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight text-accent md:text-2xl">
                        {dept.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        aria-label={`Close ${dept.name}`}
                        className="clip-cut cut-xs flex h-8 w-8 items-center justify-center text-text-muted transition-colors duration-200 hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    {/* Canvas — stacked on mobile, two-column on desktop. */}
                    <div className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto md:flex-row md:gap-8">
                      <p className="text-left text-sm leading-relaxed text-text-muted md:flex-[2] md:text-base">
                        {dept.description}
                      </p>

                      <div className="flex flex-col gap-4 md:flex-[3]">
                        {/* Photo strip */}
                        <div className="grid grid-cols-3 gap-2">
                          {dept.gallery.map((src, i) => (
                            <div key={i} className="clip-cut cut-sm relative aspect-square overflow-hidden ring-1 ring-accent/40">
                              <Image src={src} alt="" fill sizes="(min-width: 768px) 160px, 30vw" className="object-cover" />
                            </div>
                          ))}
                        </div>

                        {/* Highlight chips */}
                        <div className="flex flex-wrap gap-2">
                          {dept.highlights.map((tag) => (
                            <span
                              key={tag}
                              className="clip-cut cut-xs border border-accent/30 bg-background/60 px-2 py-1 text-xs text-text-muted"
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

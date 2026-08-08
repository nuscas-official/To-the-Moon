'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { formatInClubTime } from '@/lib/datetime'

interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
}

interface EventCardProps {
  event: ClubEvent
  detailsLabel?: string // e.g. "View" or "Details"
  dimmed?: boolean // filtered-out: faded and non-interactive, but stays in place
  featured?: boolean // hero treatment: cover image bleeds behind the whole card
  rotation?: number // static tilt (deg) applied on lg+, straightened on hover
}

// Card entry animation settings
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 95,
      damping: 15,
    },
  },
}

interface TiltWrapperProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  variants?: typeof cardVariants
}

function TiltWrapper({ children, className = '', innerClassName = '', variants }: TiltWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring configuration for smooth motion
  const springConfig = { damping: 25, stiffness: 180, mass: 0.5 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  // Transform values: map range -0.5 to 0.5 to rotation values
  // Subtler tilt is usually better, say -12 to 12 degrees
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-12, 12])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = event.clientX - rect.left - width / 2
    const mouseY = event.clientY - rect.top - height / 2
    
    x.set(mouseX / width)
    y.set(mouseY / height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        ref={cardRef}
        variants={variants}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative h-full w-full ${className}`}
      >
        {/* Children content wrapper */}
        <div
          style={{ transform: "translateZ(0px)" }}
          className={`h-full w-full flex flex-col justify-between ${innerClassName}`}
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Department badge palettes. The featured card sits on top of its own cover
// image, so it needs translucent fills instead of the pale tinted ones.
const DEPT_BADGES: Record<string, { plain: string; onImage: string }> = {
  NUSCAS: {
    plain: 'bg-violet-50 text-violet-700 border-violet-100',
    onImage: 'bg-violet-500/25 text-violet-100 border-violet-300/40',
  },
  Joint: {
    plain: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
    onImage: 'bg-amber-500/25 text-amber-100 border-amber-300/40',
  },
  CASuals: {
    plain: 'bg-sky-50 text-sky-700 border-sky-100',
    onImage: 'bg-sky-500/25 text-sky-100 border-sky-300/40',
  },
  TOPICS: {
    plain: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    onImage: 'bg-emerald-500/25 text-emerald-100 border-emerald-300/40',
  },
  Palette: {
    plain: 'bg-pink-50 text-pink-700 border-pink-100',
    onImage: 'bg-pink-500/25 text-pink-100 border-pink-300/40',
  },
}

function deptBadgeClass(dept: string, featured: boolean): string {
  const entry = DEPT_BADGES[dept]
  if (!entry) return ''
  return featured ? entry.onImage : entry.plain
}

export default function EventCard({
  event,
  detailsLabel = 'View',
  dimmed = false,
  featured = false,
  rotation = 0,
}: EventCardProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const dateStr = formatInClubTime(event.starts_at, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = formatInClubTime(event.starts_at, {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isPast = new Date(event.starts_at) < new Date()
  const displayStatus = event.status === 'cancelled' ? 'cancelled' : (isPast ? 'past' : 'upcoming')

  const params = new URLSearchParams(searchParams.toString())
  params.set('event', event.slug)
  const targetHref = `${pathname}?${params.toString()}`

  const calendarIcon = (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

  const departmentBadges = (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {!event.departments || event.departments.length === 0 ? (
        <span className={`clip-cut cut-xs text-[10px] px-2 py-0.5 font-extrabold uppercase tracking-wider border ${deptBadgeClass('NUSCAS', featured)}`}>
          NUSCAS
        </span>
      ) : event.departments.length === 3 ? (
        <span className={`clip-cut cut-xs text-[10px] px-2 py-0.5 font-extrabold uppercase tracking-wider border ${deptBadgeClass('Joint', featured)}`}>
          Joint Department
        </span>
      ) : (
        event.departments.map((dept) => (
          <span
            key={dept}
            className={`clip-cut cut-xs text-[10px] px-2 py-0.5 font-extrabold uppercase tracking-wider border ${deptBadgeClass(dept, featured)}`}
          >
            {dept}
          </span>
        ))
      )}
    </div>
  )

  const coverFallback = (
    <div className="w-full h-full bg-gradient-to-br from-accent-muted to-accent/20 flex items-center justify-center">
      <svg className="w-12 h-12 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )

  return (
    <Link
      href={targetHref}
      scroll={false}
      aria-hidden={dimmed}
      tabIndex={dimmed ? -1 : undefined}
      style={{ ['--card-rot' as string]: `${rotation}deg` }}
      className={`relative block h-full w-full origin-center transition-[opacity,transform] duration-300 ease-out lg:[transform:rotate(var(--card-rot))] lg:hover:[transform:rotate(0deg)] lg:hover:z-10 ${
        dimmed ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'
      }`}
    >
      <TiltWrapper
        variants={cardVariants}
        className={`angle-frame clip-cut group shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:[--frame-color:var(--color-accent)] transition-shadow duration-300 text-left cursor-pointer ${
          featured ? 'cut-xl' : 'cut-lg'
        }`}
        innerClassName={`clip-cut relative overflow-hidden ${featured ? 'bg-neutral-950' : 'bg-surface'}`}
      >
        {featured ? (
          /* Featured: the cover bleeds behind the whole card instead of
             sitting in a fixed 16:9 box above the text. */
          <>
            <div className="absolute inset-0">
              {event.cover_image_key ? (
                <Image
                  src={event.cover_image_key}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                coverFallback
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/10" />
            </div>

            <span className="clip-cut cut-sm absolute top-4 right-4 z-10 text-[10px] uppercase font-extrabold tracking-wider bg-accent text-white px-3 py-1">
              {displayStatus}
            </span>

            <div className="relative z-10 mt-auto p-6 flex flex-col justify-end min-h-[16rem]">
              <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold mb-3">
                {calendarIcon}
                <span>{dateStr} &middot; {timeStr}</span>
              </div>

              {departmentBadges}

              <p className="text-2xl lg:text-3xl font-sans font-black text-white line-clamp-2 leading-tight">
                {event.title}
              </p>

              {event.description && (
                <p className="hidden lg:block mt-3 text-sm text-white/70 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-white/70 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-1 max-w-[220px]">{event.location || 'Online'}</span>
                </span>

                <div className="font-extrabold text-white group-hover:underline flex items-center gap-0.5">
                  <span>{detailsLabel}</span>
                  <svg className="w-3.5 h-3.5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Cover Image */}
            <div className="relative h-32 w-full bg-neutral-100 overflow-hidden border-b border-border">
              {event.cover_image_key ? (
                <Image
                  src={event.cover_image_key}
                  alt={event.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                coverFallback
              )}
              {/* Status Badge */}
              <span className="clip-cut cut-sm absolute top-3 right-3 text-[10px] uppercase font-extrabold tracking-wider bg-neutral-900/80 backdrop-blur text-white px-2.5 py-1 border border-white/10">
                {displayStatus}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                {/* Time Info */}
                <div className="flex items-center gap-1.5 text-xs text-accent font-bold mb-2">
                  {calendarIcon}
                  <span>{dateStr} &middot; {timeStr}</span>
                </div>

                {departmentBadges}

                <p className="text-sm font-sans font-extrabold text-foreground line-clamp-1 group-hover:text-accent-hover transition-colors">
                  {event.title}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-1 max-w-[150px]">{event.location || 'Online'}</span>
                </span>

                <div className="font-extrabold text-accent group-hover:underline flex items-center gap-0.5">
                  <span>{detailsLabel}</span>
                  <svg className="w-3.5 h-3.5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </TiltWrapper>
    </Link>
  )
}

// Reusable Placeholder / Empty State Card
export function EventPlaceholderCard({ index }: { index: number }) {
  return (
    <TiltWrapper
      variants={cardVariants}
      className="clip-cut cut-lg group relative flex flex-col justify-between overflow-hidden border border-dashed border-border bg-surface/50 p-6 text-left min-h-[200px] transition-[border-color,box-shadow,background-color] duration-300 hover:border-foreground/60 shadow-sm hover:shadow-lg cursor-pointer"
    >
      <div>
        <div className="clip-cut cut-xs w-8 h-8 bg-border/60 flex items-center justify-center text-text-muted mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-text-muted">
          Event Slot {index}
        </h3>
        <p className="text-xs text-text-muted mt-2 leading-relaxed">
          Details for this upcoming activity are being finalized by the EXCO committee. Check back soon!
        </p>
      </div>
      <div className="text-[10px] uppercase tracking-wider font-black text-text-muted mt-4 border-t border-border pt-3">
        Status: Gated / Pending RLS
      </div>
    </TiltWrapper>
  )
}


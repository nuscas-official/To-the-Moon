'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'

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
}

interface EventCardProps {
  event: ClubEvent
  detailsLabel?: string // e.g. "View" or "Details"
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
  variants?: typeof cardVariants
}

function TiltWrapper({ children, className = '', variants }: TiltWrapperProps) {
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
        <div style={{ transform: "translateZ(0px)" }} className="h-full w-full flex flex-col justify-between">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

export default function EventCard({ event, detailsLabel = 'View' }: EventCardProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const dateStr = new Date(event.starts_at).toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = new Date(event.starts_at).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const params = new URLSearchParams(searchParams.toString())
  params.set('event', event.slug)
  const targetHref = `${pathname}?${params.toString()}`

  return (
    <Link href={targetHref} scroll={false} className="block h-full w-full">
      <TiltWrapper
        variants={cardVariants}
        className="group flex flex-col justify-between overflow-hidden border-2 border-border bg-surface shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-[border-color,box-shadow,background-color] duration-300 chaos-card-active text-left cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-neutral-100 overflow-hidden border-b border-border">
          {event.cover_image_key ? (
            <Image
              src={event.cover_image_key}
              alt={event.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent-muted to-accent/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <span className="absolute top-3 right-3 text-[10px] uppercase font-extrabold tracking-wider bg-neutral-900/80 backdrop-blur text-white px-2.5 py-1 rounded-full border border-white/10">
            {event.status}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-grow flex flex-col justify-between">
          <div>
            {/* Time Info */}
            <div className="flex items-center gap-1.5 text-xs text-accent font-bold mb-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateStr} &middot; {timeStr}</span>
            </div>

            <p className="text-md font-sans font-extrabold text-foreground line-clamp-1 group-hover:text-accent-hover transition-colors">
              {event.title}
            </p>

            {event.description && (
              <p className="text-xs text-text-muted mt-2 line-clamp-3 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
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
      </TiltWrapper>
    </Link>
  )
}

// Reusable Placeholder / Empty State Card
export function EventPlaceholderCard({ index }: { index: number }) {
  return (
    <TiltWrapper
      variants={cardVariants}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-left min-h-[200px] transition-[border-color,box-shadow,background-color] duration-300 hover:border-foreground/60 shadow-sm hover:shadow-lg cursor-pointer"
    >
      <div>
        <div className="w-8 h-8 rounded-lg bg-border/60 flex items-center justify-center text-text-muted mb-4">
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


'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { milestones } from './milestones'
import TimelineNode from './TimelineNode'
import Cover from './Cover'

export default function PageStrip({ className = '' }: { className?: string }) {
  // Mobile keeps the original single-page swipe carousel; desktop uses the strip.
  const [isMobile, setIsMobile] = useState(false)

  // Closed cover that swings open (gatefold) to reveal the timeline
  const [coverOpen, setCoverOpen] = useState(false)

  // Mobile carousel state
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState(1) // 1 = forward, -1 = back

  // Desktop strip
  const scrollRef = useRef<HTMLDivElement>(null)
  // Edge state drives the fade cues and the hover arrows' enabled/disabled look
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  // Detect mobile viewports
  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const totalPages = milestones.length

  // --- Mobile navigation (single-page swipe carousel) ---
  const nextPageMobile = useCallback(() => {
    if (activePageIndex < totalPages - 1) {
      setSlideDirection(1)
      setActivePageIndex(prev => prev + 1)
    }
  }, [activePageIndex, totalPages])

  const prevPageMobile = useCallback(() => {
    if (activePageIndex > 0) {
      setSlideDirection(-1)
      setActivePageIndex(prev => prev - 1)
    }
  }, [activePageIndex])

  const mobileVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? '-100%' : '100%', opacity: 0 }),
  }

  // Mobile keyboard navigation (desktop keyboard lives on the strip element)
  useEffect(() => {
    if (!isMobile) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight') nextPageMobile()
      else if (e.key === 'ArrowLeft') prevPageMobile()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, nextPageMobile, prevPageMobile])

  // Edge state powers the fade cues and the hover arrows.
  const updateEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
  }, [])

  // --- Smooth momentum scrolling ---
  // Every input nudges a target position; each animation frame a critically
  // damped spring eases the real scroll toward it. That converts discrete wheel
  // notches into one continuous glide that accelerates from rest (ease-in) and
  // settles without bouncing (ease-out). Tune feel with the two constants below.
  const SPRING_STIFFNESS = 600
  const SPRING_DAMPING = 48 // ~critical (2*sqrt(stiffness) ≈ 49) → snappy, no bounce

  const targetRef = useRef(0)
  const velocityRef = useRef(0)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const glidingRef = useRef(false)

  const glideStep = useCallback((now: number) => {
    const el = scrollRef.current
    if (!el) { glidingRef.current = false; return }
    // Clamp dt so a stall (background tab) can't fling the spring.
    const dt = Math.min(0.032, (now - lastTimeRef.current) / 1000) || 0.016
    lastTimeRef.current = now

    const max = el.scrollWidth - el.clientWidth
    targetRef.current = Math.max(0, Math.min(max, targetRef.current))

    const x = el.scrollLeft
    const accel = SPRING_STIFFNESS * (targetRef.current - x) - SPRING_DAMPING * velocityRef.current
    velocityRef.current += accel * dt
    let next = x + velocityRef.current * dt

    if (Math.abs(targetRef.current - next) < 0.4 && Math.abs(velocityRef.current) < 6) {
      el.scrollLeft = targetRef.current
      velocityRef.current = 0
      glidingRef.current = false
      updateEdges()
      return
    }
    if (next <= 0) { next = 0; velocityRef.current = 0 }
    else if (next >= max) { next = max; velocityRef.current = 0 }
    el.scrollLeft = next
    updateEdges()
    rafRef.current = requestAnimationFrame(glideStep)
  }, [updateEdges])

  const glideBy = useCallback((delta: number) => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    // Re-sync to the live position when starting a fresh glide (covers drags or
    // any native scrolling that happened since the last one).
    if (!glidingRef.current) targetRef.current = el.scrollLeft
    targetRef.current = Math.max(0, Math.min(max, targetRef.current + delta))
    if (!glidingRef.current) {
      glidingRef.current = true
      lastTimeRef.current = performance.now()
      rafRef.current = requestAnimationFrame(glideStep)
    }
  }, [glideStep])

  // Scroll by roughly one page (falls back to most of the viewport width).
  const scrollByPage = useCallback((dir: number) => {
    const el = scrollRef.current
    if (!el) return
    const page = el.querySelector<HTMLElement>('[data-page]')
    const amount = page ? page.clientWidth : el.clientWidth * 0.8
    glideBy(dir * amount)
  }, [glideBy])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByPage(1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByPage(-1) }
  }, [scrollByPage])

  // Feed a vertical mouse wheel into the smooth glide as horizontal motion.
  // Release at either edge so it never traps the page's own vertical scroll.
  useEffect(() => {
    if (isMobile) return
    const el = scrollRef.current
    if (!el) return
    updateEdges()

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (delta === 0) return
      const atStartEdge = el.scrollLeft <= 0
      const atEndEdge = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
      if ((delta < 0 && atStartEdge) || (delta > 0 && atEndEdge)) return // let the page scroll
      e.preventDefault()
      glideBy(delta)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', updateEdges)
      cancelAnimationFrame(rafRef.current)
      glidingRef.current = false
    }
  }, [isMobile, updateEdges, glideBy])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isMobile ? (
        // --- MOBILE: single-page swipe carousel (kept from the original) ---
        <div className="w-full h-full relative overflow-hidden bg-[#f7f4eb] border border-neutral-800 select-none">
          <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
            <motion.div
              key={activePageIndex}
              custom={slideDirection}
              variants={mobileVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, info) => {
                const swipeThreshold = 80
                if (info.offset.x < -swipeThreshold) nextPageMobile()
                else if (info.offset.x > swipeThreshold) prevPageMobile()
              }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="w-full h-full [&>div]:border-r-0 [&>div]:border-l-0 [&>div]:border-neutral-800">
                <TimelineNode milestone={milestones[activePageIndex]} index={activePageIndex} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        // --- DESKTOP: one long horizontal page ---
        <div className="group/strip absolute inset-0 border border-neutral-800 overflow-hidden select-none">
          {/* One long horizontal page: content pages laid edge to edge */}
          <div
            ref={scrollRef}
            onScroll={updateEdges}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="flex w-full h-full overflow-x-auto overflow-y-hidden outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {milestones.map((m, i) => (
              <div
                key={i}
                data-page
                className="flex-none h-full aspect-[3/4] border-r border-neutral-800/15 last:border-r-0 [&>div]:border-0"
              >
                <TimelineNode milestone={m} index={i} />
              </div>
            ))}
          </div>

          {/* Edge fades that hint there's more to scroll */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/10 to-transparent transition-opacity duration-200 ${atStart ? 'opacity-0' : 'opacity-100'}`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/10 to-transparent transition-opacity duration-200 ${atEnd ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Prev / Next controls (reveal on hover) */}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover/strip:opacity-100 disabled:!opacity-0 hover:bg-black/60 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover/strip:opacity-100 disabled:!opacity-0 hover:bg-black/60 transition"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Closed cover that swings open to reveal the timeline */}
      <Cover open={coverOpen} onOpen={() => setCoverOpen(true)} isMobile={isMobile} />
    </div>
  )
}

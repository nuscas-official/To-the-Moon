'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Hybrid Model Toggle: 
// Set to true once you put slide0.webp to slide7.webp in public/images/slides/
const USE_SLIDE_IMAGES = false

export default function InteractiveFlipbook({ className = '' }: { className?: string }) {
  // Mobile keeps the original single-page swipe carousel; desktop uses the strip.
  const [isMobile, setIsMobile] = useState(false)

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

  // The pages that make up the book. On desktop they scroll as one long
  // horizontal strip; on mobile they're a one-at-a-time swipe carousel.
  const pages: React.ReactNode[] = [
    // Page 1: Welcome Card
    USE_SLIDE_IMAGES ? (
      <div key="p1" className="w-full h-full relative overflow-hidden border-y border-l border-neutral-800">
        <Image src="/images/slides/slide1.webp" alt="Welcome" fill className="object-cover" />
      </div>
    ) : (
      <div key="p1" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-l border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pl-4">
          <span className="px-2 py-0.5 border border-accent/20 bg-accent/5 rounded-none text-[9px] font-mono text-accent uppercase tracking-widest inline-block">
            Introduction
          </span>
        </div>

        <div className="relative pl-4 my-auto flex flex-col items-center text-center space-y-4">
          <div className="relative w-28 h-28 border border-[#dcd1ba] bg-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Image 
              src="/images/anikun-flower.webp" 
              alt="Mascot Anikun" 
              fill
              className="object-cover object-center p-2"
              priority
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono text-[#685f5d]">
              MEET ANIKUN
            </p>
            <p className="text-[11px] text-[#685f5d] max-w-[280px] leading-relaxed">
              Our Male Mascot. [Insert Anikun Lore]
            </p>
          </div>
        </div>

        <div className="relative pl-4 text-[9px] font-mono text-[#685f5d]">
          [ PAGE 01 ]
        </div>
      </div>
    ),
    // Page 2: Spread 1 Right (CASuals & TOPICS)
    USE_SLIDE_IMAGES ? (
      <div key="p2" className="w-full h-full relative overflow-hidden border-y border-r border-neutral-800">
        <Image src="/images/slides/slide2.webp" alt="CASuals & TOPICS" fill className="object-cover" />
      </div>
    ) : (
      <div key="p2" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-r border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute right-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pr-4">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            About Us
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Our Departments
          </h3>
        </div>

        <div className="relative pr-4 space-y-3 my-auto">
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
            <h4 className="text-xs font-mono text-accent font-bold">CASuals</h4>
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Gaming Gauntlets, Cosplay, Concert Watchalongs, Japan Tips, Escape Room, Game Shows, Beyblade, Anime Debates and the Anime Awards, everything ACG-adjacent is under CASuals. With practically no restrictions, CASuals is where &quot;Wouldn&apos;t it be funny if...&quot; often becomes &quot;We&apos;re actually doing this.&quot; 
            </p>
          </div>
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
            <h4 className="text-xs font-mono text-accent font-bold">TOPICS</h4>
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Explore the finer points of writing and storytelling through Media Analysis, Reviews and Fanfiction in NUSCAS&apos; writing-focused department. Beyond writing, TOPICS is also responsible for running the NUSCAS&apos; Instagram and keeping the club&apos;s online presence alive. And last but not least, look forward to the annual TOPICS D&amp;D!
            </p>
          </div>
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
            <h4 className="text-xs font-mono text-accent font-bold">Palette</h4>
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Nurture your artistic flair with lessons on art and graphic design. Palette is the art-focused department of NUSCAS and the beating heart behind everything booth-related. With a vibrant community of artists from all walks of life, Palette offers activities beyond drawing, including crochet, Gunpla, bookbinding, and much more.            </p>
          </div>
        </div>

        <div className="relative pr-4 flex justify-end text-[9px] font-mono text-[#685f5d]">
          [ PAGE 02 ]
        </div>
      </div>
    ),
    // Page 3: Spread 2 Left (Palette Dept)
    USE_SLIDE_IMAGES ? (
      <div key="p3" className="w-full h-full relative overflow-hidden border-y border-l border-neutral-800">
        <Image src="/images/slides/slide3.webp" alt="Palette" fill className="object-cover" />
      </div>
    ) : (
      <div key="p3" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-l border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pl-4">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            DIVISION 02 / ART & CREATION
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Palette
          </h3>
        </div>

        <div className="relative pl-4 space-y-3 my-auto">
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-2">
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Where ideas transform into sketchbooks and digital spreads. Palette is our hub for character illustrators, comic artists, and designers.
            </p>
            
            <div className="flex gap-2 items-center justify-center pt-1 border-t border-[#dcd1ba]">
              <span className="text-[8px] font-mono text-[#685f5d] mr-1 uppercase">Palette:</span>
              <span className="w-3.5 h-3.5 rounded-full bg-accent border border-white/20" title="Crimson" />
              <span className="w-3.5 h-3.5 rounded-full bg-accent-gold border border-white/20" title="Gold" />
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-white/20" title="Teal" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white/20" title="Green" />
            </div>
          </div>

          <div className="p-2 border border-dashed border-[#dcd1ba] rounded-none text-center">
            <span className="text-[9px] font-mono text-[#685f5d] italic">
              Annual Fanzine Publications & Merch!
            </span>
          </div>
        </div>

        <div className="relative pl-4 text-[9px] font-mono text-[#685f5d]">
          [ PAGE 03 ]
        </div>
      </div>
    ),
    // Page 4: Spread 2 Right
    USE_SLIDE_IMAGES ? (
      <div key="p4" className="w-full h-full relative overflow-hidden border-y border-r border-neutral-800">
        <Image src="/images/slides/slide4.webp" alt="Not Ramen Challenge" fill className="object-cover" />
        {/* Transparent Rock Paper Scissors Overlay Buttons */}
        <div className="absolute bottom-[18%] left-[8%] right-[8%] h-[24%] grid grid-cols-3 gap-2 z-10">
          <button 
            onClick={() => alert("You chose Rock!")} 
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Rock"
          />
          <button 
            onClick={() => alert("You chose Paper!")} 
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Paper"
          />
          <button 
            onClick={() => alert("You chose Scissors!")} 
            className="w-full h-full bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer"
            aria-label="Choose Scissors"
          />
        </div>
      </div>
    ) : (
      <div key="p4" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-r border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute right-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pr-4">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            PLACEHOLDER TEXT
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Placeholder Text
          </h3>
        </div>

        <div className="relative pr-4 my-auto space-y-3">
          <p className="text-[10px] text-[#685f5d] leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
              <span className="block text-lg">✊</span>
              <span className="text-[8px] font-mono block mt-1">ROCK</span>
            </div>
            <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
              <span className="block text-lg">✋</span>
              <span className="text-[8px] font-mono block mt-1">PAPER</span>
            </div>
            <div className="px-1 py-2 bg-white border border-[#dcd1ba] rounded-none hover:border-accent hover:text-accent transition duration-200 cursor-pointer">
              <span className="block text-lg">✌️</span>
              <span className="text-[8px] font-mono block mt-1">SCISSORS</span>
            </div>
          </div>
          
          <div className="text-[8px] font-mono text-center text-[#685f5d] uppercase tracking-wide">
            * Win rate: 33.3% // Saltiness level: 100%
          </div>
        </div>

        <div className="relative pr-4 flex justify-end text-[9px] font-mono text-[#685f5d]">
          [ PAGE 04 ]
        </div>
      </div>
    ),
    // Page 5: Spread 3 Left (PowerPoint VNs)
    USE_SLIDE_IMAGES ? (
      <div key="p5" className="w-full h-full relative overflow-hidden border-y border-l border-neutral-800">
        <Image src="/images/slides/slide5.webp" alt="PowerPoint VNs" fill className="object-cover" />
        {/* Transparent Click target for VN dialogue */}
        <button 
          onClick={() => alert("PowerPoint VN: Dialogue Advanced!")}
          className="absolute bottom-[8%] left-[5%] right-[5%] h-[32%] bg-transparent hover:bg-black/5 active:bg-black/10 border border-transparent transition cursor-pointer z-10"
          aria-label="Next Dialogue"
        />
      </div>
    ) : (
      <div key="p5" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-l border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pl-4">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            OUR MEMBERS&apos; WORK
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Animatic
          </h3>
        </div>

        <div className="relative pl-4 my-auto">
          <div className="w-full aspect-[16/9] border border-[#dcd1ba] rounded-none bg-neutral-950 relative overflow-hidden flex flex-col justify-end p-2.5">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at center, #6b21a8 0%, #1e1b4b 100%)'
              }}
            />
            <div className="absolute top-2 right-2 text-[8px] font-mono text-white/50 bg-black/60 px-1 rounded-none">
              SLIDE 42/150
            </div>
            
            <div className="relative z-10 w-full bg-black/85 border border-white/15 p-2 rounded-none flex flex-col justify-between">
              <span className="text-[8px] font-mono text-accent font-bold uppercase tracking-wider">
                ANITAN:
              </span>
              <span className="text-[9px] text-neutral-200 leading-normal mt-0.5">
                &quot;Wait... you are building this interactive flipbook using Framer Motion 3D transforms?!&quot;
              </span>
              
              <div className="flex gap-2 justify-end text-[7px] font-mono text-neutral-500 uppercase tracking-widest mt-1.5 pt-1 border-t border-white/5">
                <span>[ CLICK TO NEXT ]</span>
                <span>[ SKIP ]</span>
              </div>
            </div>
          </div>
          
          <p className="text-[8px] font-mono text-[#685f5d] mt-2 text-center leading-relaxed">
            Why use Unity when PowerPoint has *Wipe* and *Fade*?
          </p>
        </div>

        <div className="relative pl-4 text-[9px] font-mono text-[#685f5d]">
          [ PAGE 05 ]
        </div>
      </div>
    ),
    // Page 6: Spread 3 Right (Member Perks)
    USE_SLIDE_IMAGES ? (
      <div key="p6" className="w-full h-full relative overflow-hidden border-y border-r border-neutral-800">
        <Image src="/images/slides/slide6.webp" alt="Member Perks" fill className="object-cover" />
      </div>
    ) : (
      <div key="p6" className="w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y border-r border-neutral-800">
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        <div className="absolute right-6 top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40" />

        <div className="relative pr-4">
          <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-1">
            EXCLUSIVE OFFERS
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            Member Perks
          </h3>
        </div>

        <div className="relative pr-4 my-auto">
          <ul className="space-y-2 text-[10px] text-[#685f5d] font-sans">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✦</span>
              <span>Access to the library of 200+ manga, light novels and artbooks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✦</span>
              <span>Active screening review ratings submission on our portal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✦</span>
              <span>Exclusive Discord channels & networking with alumni in creative jobs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✦</span>
              <span>Fanzine publication privileges & artist showcase stands.</span>
            </li>
          </ul>
        </div>

        <div className="relative pr-4 flex justify-end text-[9px] font-mono text-[#685f5d]">
          [ PAGE 06 ]
        </div>
      </div>
    ),
  ]

  // The strip is simply all content pages, laid edge to edge as one long page.
  const contentPages = pages
  const totalPages = pages.length

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
                {pages[activePageIndex]}
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
          {contentPages.map((page, i) => (
            <div
              key={i}
              data-page
              className="flex-none h-full aspect-[3/4] border-r border-neutral-800/15 last:border-r-0 [&>div]:border-0"
            >
              {page}
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
    </div>
  )
}

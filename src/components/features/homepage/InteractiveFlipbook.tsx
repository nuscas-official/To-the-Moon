'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate, MotionValue } from 'framer-motion'
import Image from 'next/image'

// Hybrid Model Toggle: 
// Set to true once you put slide0.webp to slide7.webp in public/images/slides/
const USE_SLIDE_IMAGES = false

export default function InteractiveFlipbook({ className = '' }: { className?: string }) {
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [flippingState, setFlippingState] = useState<'none' | 'forward' | 'backward'>('none')
  const [isMobile, setIsMobile] = useState(false)
  const [slideDirection, setSlideDirection] = useState(1) // 1 = forward, -1 = backward
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  // Refs to avoid stale closures in the transform function
  const flippingStateRef = useRef(flippingState)
  const currentSpreadIndexRef = useRef(0)
  const isMobileRef = useRef(isMobile)
  const containerHeight = useRef(500)

  // Keep refs in sync with state
  useEffect(() => {
    flippingStateRef.current = flippingState
  }, [flippingState])

  useEffect(() => {
    isMobileRef.current = isMobile
  }, [isMobile])

  // Motion Value for 3D page flip rotation
  const rotateYVal = useMotionValue(0)
  const dyVal = useMotionValue(0)

  // Dynamic transforms to bend/twist the page
  // 1. Tame the X-axis tilt to prevent corners from digging into the book
const rotateXVal = useTransform(
    [rotateYVal, dyVal],
    ([latestRotateY, latestDy]) => {
      const r = Number(latestRotateY)
      // STRICT CLAMP: Prevent spring bounce from breaking 3D space
      const clampedR = Math.max(-180, Math.min(0, r))
      const dy = Number(latestDy)
      const h = containerHeight.current || 500
      
      const progressFactor = Math.abs(Math.sin((clampedR * Math.PI) / 180)) 
      const dyRatio = Math.max(-1, Math.min(1, dy / h))
      
      return dyRatio * 8 * progressFactor
    }
  )

  // 2. Reduce excessive arching and twisting that breaks the rigid plane illusion
const rotateZVal = useTransform(
    [rotateYVal, dyVal],
    ([latestRotateY, latestDy]) => {
      const r = Number(latestRotateY)
      const clampedR = Math.max(-180, Math.min(0, r))
      const dy = Number(latestDy)
      const h = containerHeight.current || 500
      
      const progressFactor = Math.abs(Math.sin((clampedR * Math.PI) / 180))
      const isForward = flippingStateRef.current === 'forward'
      const archAmount = isForward ? -4 : 4
      const arch = progressFactor * archAmount
      
      const dyRatio = Math.max(-1, Math.min(1, dy / h))
      const twist = dyRatio * 5
      
      return arch + twist
    }
  )

  // 3. Keep the skew for that "curling" paper feel, but soften it
const skewYVal = useTransform(
    [rotateYVal, dyVal],
    ([latestRotateY, latestDy]) => {
      const r = Number(latestRotateY)
      const clampedR = Math.max(-180, Math.min(0, r))
      const dy = Number(latestDy)
      const h = containerHeight.current || 500
      
      const progressFactor = Math.abs(Math.sin((clampedR * Math.PI) / 180))
      const isForward = flippingStateRef.current === 'forward'
      const skewDirection = isForward ? 6 : -6
      
      const dyRatio = Math.max(-1, Math.min(1, dy / h))
      return progressFactor * dyRatio * skewDirection
    }
  )

// 4. Parachute Z-lift
  const zMotionVal = useTransform(
    [rotateYVal, dyVal],
    ([latestRotateY, latestDy]) => {
      const r = Number(latestRotateY)
      const clampedR = Math.max(-180, Math.min(0, r))
      const dy = Number(latestDy)
      const h = containerHeight.current || 500
      
      const progressFactor = Math.abs(Math.sin((clampedR * Math.PI) / 180))
      // PARACHUTE EFFECT: Square root curve makes it pop up fast and stay high longer
      const zProgress = Math.pow(progressFactor, 0.5)
      
      const isForward = flippingStateRef.current === 'forward'
      const sheetIdx = isForward ? currentSpreadIndexRef.current : currentSpreadIndexRef.current - 1
      
      const startingZ = isForward ? (3 - sheetIdx) * 2 : sheetIdx * 2
      const targetZ = isForward ? sheetIdx * 2 : (3 - sheetIdx) * 2
      
      const t = isForward ? (clampedR / -180) : ((clampedR + 180) / 180)
      const clampedT = Math.max(0, Math.min(1, t))
      
      const baseZ = (1 - clampedT) * startingZ + clampedT * targetZ
      
      // Use the fatter zProgress curve for clearance
      let lift = zProgress * 60
      const dyRatio = Math.abs(Math.max(-1, Math.min(1, dy / h)))
      lift += zProgress * (dyRatio * 40)
      
      return baseZ + lift
    }
  )

  // Dynamic shadows and highlights for curling effect
  const frontShadowOpacity = useTransform(rotateYVal, (r) => {
    const progress = Math.abs(Math.sin((r * Math.PI) / 180))
    return progress * 0.3
  })

  const backShadowOpacity = useTransform(rotateYVal, (r) => {
    const progress = Math.abs(Math.sin((r * Math.PI) / 180))
    return progress * 0.3
  })

  const highlightOpacity = useTransform(rotateYVal, (r) => {
    const progress = Math.abs(Math.sin((r * Math.PI) / 180))
    return progress * 0.15
  })

  // Translation Motion Value for sliding turns
  const xMotionVal = useMotionValue(activePageIndex === 0 ? '-25%' : activePageIndex === 7 ? '25%' : '0%')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const halfBookWidth = useRef(360)

  // Detect mobile viewports
  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Flat Array of Pages (8 pages total)
  const pages: React.ReactNode[] = [
    // Page 0: FRONT COVER (Closed book cover)
    USE_SLIDE_IMAGES ? (
      <div key="p0" className="w-full h-full relative overflow-hidden border-y border-l border-neutral-800">
        <Image src="/images/slides/slide0.webp" alt="Front Cover" fill className="object-cover" priority />
      </div>
    ) : (
      <div key="p0" className="w-full h-full flex flex-col justify-between p-6 bg-[#8c0e1a] text-[#f7f4eb] relative overflow-hidden border-y border-l border-neutral-800">
        {/* Subtle halftone background */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        {/* Cover graphic frame decoration */}
        <div className="absolute inset-4 border border-[#c5a059]/30 pointer-events-none" />
        <div className="absolute inset-5 border border-[#c5a059]/10 pointer-events-none" />
        <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-[#c5a059]/20" />

        <div className="relative pl-4 space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#c5a059] uppercase tracking-widest">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c5a059]"></span>
            </span>
            <span>NUSCAS // VOL. 27</span>
          </div>
          
          <h2 className="text-4xl font-serif italic font-black leading-none tracking-tight text-[#f7f4eb]">
            NUS<br />
            <span className="text-[#c5a059] font-sans not-italic font-black text-5xl tracking-normal">COMIC</span><br />
            ARTS
          </h2>
          <p className="text-[10px] text-neutral-300 font-mono tracking-wider">
            SOCIETY // MEMBER PORTAL
          </p>
        </div>

        <div className="relative pl-4 flex items-center justify-between border-t border-[#c5a059]/25 pt-4 z-10">
          <div>
            <div className="text-[9px] font-mono text-[#c5a059] tracking-wider uppercase">
              EST. 1999 // ROS 0233
            </div>
            <div className="text-[10px] font-serif italic text-neutral-300 mt-0.5">
              &quot;We take fun seriously.&quot;
            </div>
          </div>
          
          {/* Issue sticker badge */}
          <div className="px-2 py-1 bg-[#c5a059] text-[#1a1616] text-[8px] font-mono font-bold tracking-widest leading-none">
            ISSUE 27
          </div>
        </div>
      </div>
    ),
    // Page 1: Spread 1 Left (Welcome Card)
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
            <p className="text-[11px] text-[#685f5d] max-w-[200px] leading-relaxed">
              Welcome to our pocket universe. A space dedicated to comic creators, appreciators, and everyone in between.
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
            DIVISION 01 / SCREENING & TALKS
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            CASuals & TOPICS
          </h3>
        </div>

        <div className="relative pr-4 space-y-3 my-auto">
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
            <h4 className="text-xs font-mono text-accent font-bold">CASuals: Weekly Screenings</h4>
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Every Friday, we host casual screenings of hidden masterpieces, seasonal favorites, and legendary animation classics. Complete with snacks and community vibes.
            </p>
          </div>
          <div className="p-3 bg-white border border-[#dcd1ba] rounded-none space-y-1.5">
            <h4 className="text-xs font-mono text-accent font-bold">TOPICS: Discussion Panels</h4>
            <p className="text-[10px] text-[#685f5d] leading-relaxed">
              Deep dive panel presentations on history, scriptwriting, voice acting, and industry analysis. We take anime seriously.
            </p>
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
        <Image src="/images/slides/slide3.webp" alt="Palette Department" fill className="object-cover" />
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
            Palette Department
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
    // Page 4: Spread 2 Right (Ramen Challenge)
    USE_SLIDE_IMAGES ? (
      <div key="p4" className="w-full h-full relative overflow-hidden border-y border-r border-neutral-800">
        <Image src="/images/slides/slide4.webp" alt="Ramen Challenge" fill className="object-cover" />
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
            THE SACRED TRADITION
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            The Ramen Challenge
          </h3>
        </div>

        <div className="relative pr-4 my-auto space-y-3">
          <p className="text-[10px] text-[#685f5d] leading-relaxed">
            Every weekly screening comes with a catch. To claim the legendary **Free Instant Ramen**, you must challenge the reigning President to an intense Rock-Paper-Scissors duel.
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
            ENGINEERING MARVELS
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#1a1616] leading-none">
            PowerPoint VNs
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
    // Page 7: BACK COVER (Closed book back cover)
    USE_SLIDE_IMAGES ? (
      <div key="p7" className="w-full h-full relative overflow-hidden border-y border-r border-neutral-800">
        <Image src="/images/slides/slide7.webp" alt="Back Cover" fill className="object-cover" />
        {/* Transparent Overlay links for Join Us and Discord */}
        <div className="absolute bottom-[20%] left-[12%] right-[12%] h-[12%] flex gap-2 z-10">
          <a 
            href="#join"
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById('join-section') || document.querySelector('.club-card');
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-grow h-full bg-transparent hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
            aria-label="Join Us"
          />
          <a 
            href="https://discord.gg/nuscas" 
            target="_blank" 
            rel="noreferrer"
            className="flex-grow h-full bg-transparent hover:bg-white/5 active:bg-white/10 transition cursor-pointer"
            aria-label="Join Discord"
          />
        </div>
      </div>
    ) : (
      <div key="p7" className="w-full h-full flex flex-col justify-between p-6 bg-[#8c0e1a] text-[#f7f4eb] relative overflow-hidden border-y border-r border-neutral-800">
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }}
        />
        {/* Cover graphic frame decoration */}
        <div className="absolute inset-4 border border-[#c5a059]/30 pointer-events-none" />
        <div className="absolute right-6 top-6 bottom-6 w-[1px] bg-[#c5a059]/20" />

        <div className="relative pr-4 text-right">
          <span className="text-[9px] font-mono text-[#c5a059] uppercase tracking-widest block mb-1">
            MEMBER LOG SYSTEM
          </span>
          <h3 className="text-xl font-serif italic font-black text-[#f7f4eb] leading-none">
            NUSCAS Portal
          </h3>
        </div>

        <div className="relative pr-4 my-auto flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20 pointer-events-none select-none z-10 animate-float">
            <Image
              src="/images/anitan-thumbs-up.webp"
              alt="Anitan thumbs up"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] font-bold text-[#f7f4eb] uppercase tracking-wide font-serif italic">
              To the Moon!
            </p>
            <p className="text-[9px] text-neutral-300 max-w-[180px] mx-auto leading-relaxed">
              Connect with Singapore&apos;s biggest animation and comic fan community.
            </p>
          </div>

          <div className="flex gap-2 w-full max-w-[200px]">
            <a 
              href="#join"
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById('join-section') || document.querySelector('.club-card');
                target?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-grow py-1.5 text-center bg-[#c5a059] hover:bg-[#ab8741] text-[#1a1616] text-[9px] font-mono font-bold rounded-none uppercase tracking-wider transition hover:scale-105 active:scale-95 duration-150 shadow"
            >
              Join Us
            </a>
            <a 
              href="https://discord.gg/nuscas" 
              target="_blank" 
              rel="noreferrer"
              className="flex-grow py-1.5 text-center bg-[#1a1616] hover:bg-black border border-[#c5a059]/30 text-[#f7f4eb] text-[9px] font-mono font-bold rounded-none uppercase tracking-wider transition hover:scale-105 active:scale-95 duration-150"
            >
              Discord
            </a>
          </div>
        </div>

        {/* Comic barcode & publication details footer */}
        <div className="relative pr-4 flex items-end justify-between border-t border-[#c5a059]/25 pt-4 z-10 text-[8px] font-mono text-[#c5a059]">
          <div className="text-left leading-tight">
            <span>EDITED & PUBLISHED BY</span><br />
            <span className="text-white">NUSCAS COMMITTEE 2026</span>
          </div>

          {/* Barcode representation */}
          <div className="flex flex-col items-center bg-white p-1">
            <div className="flex items-stretch h-5 gap-[1px]">
              <span className="w-[1px] bg-black" />
              <span className="w-[2px] bg-black" />
              <span className="w-[1px] bg-black" />
              <span className="w-[3px] bg-black" />
              <span className="w-[1px] bg-black" />
              <span className="w-[1px] bg-black" />
              <span className="w-[2px] bg-black" />
              <span className="w-[1px] bg-black" />
              <span className="w-[3px] bg-black" />
              <span className="w-[1px] bg-black" />
            </div>
            <span className="text-[6px] text-black scale-90 mt-0.5 leading-none">FREE FOR MEMBERS</span>
          </div>
        </div>
      </div>
    )
  ]

  const totalPages = pages.length
  // Spreads mapping: 
  // Spread 0: Left = Empty, Right = Page 0
  // Spread 1: Left = Page 1, Right = Page 2
  // Spread 2: Left = Page 3, Right = Page 4
  // Spread 3: Left = Page 5, Right = Page 6
  // Spread 4: Left = Page 7, Right = Empty
  const totalSpreads = 5

  // Map activePageIndex to SpreadIndex on Desktop
  const getSpreadIndex = useCallback((pageIdx: number) => {
    if (pageIdx === 0) return 0
    if (pageIdx === totalPages - 1) return totalSpreads - 1
    return Math.floor((pageIdx - 1) / 2) + 1
  }, [totalPages, totalSpreads])

  const currentSpreadIndex = getSpreadIndex(activePageIndex)

  useEffect(() => {
    currentSpreadIndexRef.current = currentSpreadIndex
  }, [currentSpreadIndex])

  // Synchronize translation offset when book is static
  useEffect(() => {
    if (flippingState === 'none') {
      if (isMobile) {
        xMotionVal.set('0%')
      } else if (currentSpreadIndex === 0) {
        xMotionVal.set('-25%')
      } else if (currentSpreadIndex === totalSpreads - 1) {
        xMotionVal.set('25%')
      } else {
        xMotionVal.set('0%')
      }
    }
  }, [flippingState, currentSpreadIndex, isMobile, totalSpreads, xMotionVal])

  // Mobile navigation page by page
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

  // Desktop navigation spread by spread (programmatic flips)
  const nextSpread = useCallback(() => {
    if (currentSpreadIndex < totalSpreads - 1 && flippingState === 'none') {
      setFlippingState('forward')
      rotateYVal.set(0)
      
  const springConfig = {
        type: 'spring',
        stiffness: 300, 
        damping: 30,
        mass: 1,
      } as const

      animate(rotateYVal, -180, {
        ...springConfig,
        onComplete: () => {
          setActivePageIndex((currentSpreadIndex + 1) * 2 - 1)
          setFlippingState('none')
        }
      })

      // Slide in sync with turn for forward flips
      if (currentSpreadIndex === 0) {
        animate(xMotionVal, '0%', springConfig)
      } else if (currentSpreadIndex === 3) {
        animate(xMotionVal, '25%', springConfig)
      }
    }
  }, [currentSpreadIndex, totalSpreads, flippingState, rotateYVal, xMotionVal])

  const prevSpread = useCallback(() => {
    if (currentSpreadIndex > 0 && flippingState === 'none') {
      setFlippingState('backward')
      rotateYVal.set(-180)

      const springConfig = {
        type: 'spring',
        stiffness: 240,
        damping: 24,
      } as const

      animate(rotateYVal, 0, {
        ...springConfig,
        onComplete: () => {
          setActivePageIndex((currentSpreadIndex - 1) * 2)
          setFlippingState('none')
        }
      })

      // Slide in sync with turn for backward flips
      if (currentSpreadIndex === 1) {
        animate(xMotionVal, '-25%', springConfig)
      } else if (currentSpreadIndex === 4) {
        animate(xMotionVal, '0%', springConfig)
      }
    }
  }, [currentSpreadIndex, flippingState, rotateYVal, xMotionVal])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      
      if (e.key === 'ArrowRight') {
        if (isMobile) {
          nextPageMobile()
        } else {
          nextSpread()
        }
      } else if (e.key === 'ArrowLeft') {
        if (isMobile) {
          prevPageMobile()
        } else {
          prevSpread()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, nextSpread, prevSpread, nextPageMobile, prevPageMobile])

  // Desktop Pointer Events (Manual Drag & Lift turns)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore button/link click interactions
    if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return
    if (isMobile) return
    if (flippingState !== 'none') return

    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = e.clientX - rect.left
    const halfWidth = rect.width / 2
    
    halfBookWidth.current = halfWidth
    containerHeight.current = rect.height
    dragStartX.current = e.clientX
    dragStartY.current = e.clientY
    isDragging.current = true

    e.currentTarget.setPointerCapture(e.pointerId)

    if (relativeX > halfWidth && currentSpreadIndex < totalSpreads - 1) {
      setFlippingState('forward')
      rotateYVal.set(0)
      dyVal.set(0)
    } else if (relativeX < halfWidth && currentSpreadIndex > 0) {
      setFlippingState('backward')
      rotateYVal.set(-180)
      dyVal.set(0)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return

    const dx = e.clientX - dragStartX.current
    const dy = e.clientY - dragStartY.current
    const halfWidth = halfBookWidth.current

    dyVal.set(dy)

    if (flippingState === 'forward') {
      // Leftward dragging flips right page left (using inverse cosine for precise cursor tracking)
      const ratio = Math.max(-1, Math.min(1, 1 + dx / halfWidth))
      const rotation = -Math.acos(ratio) * (180 / Math.PI)
      rotateYVal.set(rotation)

      // Slide container in real-time during forward flips
      const progress = rotation / -180
      if (currentSpreadIndex === 0) {
        xMotionVal.set(`${-25 * (1 - progress)}%`)
      } else if (currentSpreadIndex === 3) {
        xMotionVal.set(`${25 * progress}%`)
      }
    } else if (flippingState === 'backward') {
      // Rightward dragging flips left page right (using inverse cosine for precise cursor tracking)
      const ratio = Math.max(-1, Math.min(1, 1 - dx / halfWidth))
      const rotation = -180 + Math.acos(ratio) * (180 / Math.PI)
      rotateYVal.set(rotation)

      // Slide container in real-time during backward flips
      const progress = (rotation + 180) / 180
      if (currentSpreadIndex === 1) {
        xMotionVal.set(`${-25 * progress}%`)
      } else if (currentSpreadIndex === 4) {
        xMotionVal.set(`${25 * (1 - progress)}%`)
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    isDragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)

    const currentRotation = rotateYVal.get()
    const springConfig = {
      type: 'spring',
      stiffness: 280,
      damping: 24,
    } as const

    if (flippingState === 'forward') {
      // Complete turn if dragged past 60 degrees (i.e. <= -60), else snap back to 0
      if (currentRotation <= -60) {
        animate(rotateYVal, -180, {
          ...springConfig,
          onComplete: () => {
            setActivePageIndex((currentSpreadIndex + 1) * 2 - 1)
            setFlippingState('none')
          }
        })
        if (currentSpreadIndex === 0) {
          animate(xMotionVal, '0%', springConfig)
        } else if (currentSpreadIndex === 3) {
          animate(xMotionVal, '25%', springConfig)
        }
      } else {
        animate(rotateYVal, 0, {
          ...springConfig,
          onComplete: () => {
            setFlippingState('none')
          }
        })
        if (currentSpreadIndex === 0) {
          animate(xMotionVal, '-25%', springConfig)
        } else if (currentSpreadIndex === 3) {
          animate(xMotionVal, '0%', springConfig)
        }
      }
      animate(dyVal, 0, springConfig)
    } else if (flippingState === 'backward') {
      // Complete turn if dragged past 60 degrees from -180 (i.e. >= -120), else snap back to -180
      if (currentRotation >= -120) {
        animate(rotateYVal, 0, {
          ...springConfig,
          onComplete: () => {
            setActivePageIndex((currentSpreadIndex - 1) * 2)
            setFlippingState('none')
          }
        })
        if (currentSpreadIndex === 1) {
          animate(xMotionVal, '-25%', springConfig)
        } else if (currentSpreadIndex === 4) {
          animate(xMotionVal, '0%', springConfig)
        }
      } else {
        animate(rotateYVal, -180, {
          ...springConfig,
          onComplete: () => {
            setFlippingState('none')
          }
        })
        if (currentSpreadIndex === 1) {
          animate(xMotionVal, '0%', springConfig)
        } else if (currentSpreadIndex === 4) {
          animate(xMotionVal, '25%', springConfig)
        }
      }
      animate(dyVal, 0, springConfig)
    }
  }

  // 3D Parallax Mouse movement (desktop only, hover state only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: x * 8, y: y * -8 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }


  // Mobile slider enter/center/exit animations
  const mobileVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }



  return (
    <div 
      ref={wrapperRef}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D / Fluid Book Container */}
      <motion.div 
        ref={containerRef}
        className="relative w-full h-full flex select-none z-10"
        onMouseMove={handleMouseMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        animate={{
          rotateX: isMobile ? 0 : tilt.y,
          rotateY: isMobile ? 0 : tilt.x,
        }}
        transition={{ 
          rotateX: { type: 'tween', duration: 0.1 },
          rotateY: { type: 'tween', duration: 0.1 },
        }}
        style={{
          x: xMotionVal,
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
          perspective: isMobile ? 'none' : '1500px',
        }}
      >
        {isMobile ? (
          // --- MOBILE: Single Page Slider with Swipe Gestures ---
          <div className="w-full h-full relative overflow-hidden bg-[#f7f4eb] border border-neutral-800">
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
                  if (info.offset.x < -swipeThreshold) {
                    nextPageMobile()
                  } else if (info.offset.x > swipeThreshold) {
                    prevPageMobile()
                  }
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
          // --- DESKTOP: Double Page Spread with Closed Covers & Lift Gestures ---
          <>
          {/* Spine (Center Crease) - Subtle Version */}
          {currentSpreadIndex > 0 && currentSpreadIndex < totalSpreads - 1 && (
            <>
            <>
              <div className="absolute right-1/2 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-transparent via-black/[0.02] to-black/10" style={{ transform: 'translateZ(7px)' }} />
              
              <div className="absolute left-1/2 top-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-transparent via-black/[0.02] to-black/10" style={{ transform: 'translateZ(7px)' }} />

              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 pointer-events-none bg-gradient-to-r from-transparent via-black/30 to-transparent" style={{ transform: 'translateZ(7.1px)' }} />

              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] pointer-events-none bg-white/10 mix-blend-overlay opacity-30" style={{ transform: 'translateZ(7.2px)' }} />
            </>
            </>
          )}

          {/* Render Stacked 3D Sheets */}
          {[0, 1, 2, 3].map((sheetIdx) => {
            const isFlippingForward = flippingState === 'forward' && sheetIdx === currentSpreadIndex
            const isFlippingBackward = flippingState === 'backward' && sheetIdx === currentSpreadIndex - 1
            const isFlipping = isFlippingForward || isFlippingBackward

            let rotationY: number | MotionValue<number> = 0
            if (isFlipping) {
              rotationY = rotateYVal
            } else if (sheetIdx < currentSpreadIndex) {
              rotationY = -180
            } else {
              rotationY = 0
            }

            const restingZ = sheetIdx < currentSpreadIndex ? sheetIdx * 2 : (3 - sheetIdx) * 2
            const sheetZ: number | MotionValue<number> = isFlipping ? zMotionVal : restingZ

            return (
              <motion.div
                key={`sheet-${sheetIdx}`}
                className="absolute right-0 top-0 w-1/2 h-full"
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  rotateY: rotationY,
                  rotateX: isFlipping ? rotateXVal : 0,
                  rotateZ: isFlipping ? rotateZVal : 0,
                  skewY: isFlipping ? skewYVal : 0,
                  z: sheetZ,
                }}
              >
                {/* Front of Sheet (Right Page when open, facing front) */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-900 border-r border-neutral-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0.2px)',
                  }}
                >
                  {pages[2 * sheetIdx]}
                  {/* Dynamic Shading & Highlight */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/25 via-transparent to-black/2 mix-blend-multiply"
                    style={{ opacity: isFlipping ? frontShadowOpacity : 0 }}
                  />
                  <motion.div 
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent mix-blend-overlay"
                    style={{ opacity: isFlipping ? highlightOpacity : 0 }}
                  />
                </div>

                {/* Back of Sheet (Left Page when open, facing back) */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-900 border-l border-neutral-800"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(0.2px)',
                  }}
                >
                  {pages[2 * sheetIdx + 1]}
                  {/* Dynamic Shading & Highlight */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/2 mix-blend-multiply to-black/25"
                    style={{ opacity: isFlipping ? backShadowOpacity : 0 }}
                  />
                  <motion.div 
                    className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent mix-blend-overlay"
                    style={{ opacity: isFlipping ? highlightOpacity : 0 }}
                  />
                </div>
              </motion.div>
            )
          })}

          </>
        )}
      </motion.div>

    </div>
  )
}

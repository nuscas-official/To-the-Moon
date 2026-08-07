'use client'

import React from 'react'
import Image from 'next/image'

// Matches the flip easing/feel used elsewhere (see ClubDepartments).
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Both halves hide their own backface, so each simply vanishes as it swings past
// 90° — revealing the timeline behind without needing a separate back face.
const FACE: React.CSSProperties = {
  transformStyle: 'preserve-3d',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transition: `transform 800ms ${EASE}, opacity 800ms ${EASE}`,
}

const COVER_BG = '#241f1d'
const CREAM = '#f2ead9'
const GOLD = '#c5a059'

function Identity({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 self-start">
        <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border border-[#c5a059]/40 bg-white/95">
          <Image src="/images/anikun-flower.webp" alt="NUSCAS mascot" fill className="object-cover p-1" />
        </div>
        <div>
          <p className="font-serif text-2xl tracking-[0.06em] leading-none">NUSCAS</p>
          <p className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            Est. 1999
          </p>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="relative w-32 h-32 rounded-full overflow-hidden border border-[#c5a059]/40 bg-white/95">
        <Image src="/images/anikun-flower.webp" alt="NUSCAS mascot" fill className="object-cover p-1.5" />
      </div>
      <div className="space-y-2">
        <p className="font-serif text-3xl tracking-[0.06em] leading-none">NUSCAS</p>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: GOLD }}>
          Est. 1999
        </p>
      </div>
    </>
  )
}

function Purpose({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="w-full flex flex-col items-start gap-2.5 text-left">
        <span className="text-[12px] font-mono uppercase tracking-[0.3em]" style={{ color: GOLD }}>
          Our Story
        </span>
        <p className="text-[14px] leading-relaxed text-[#f2ead9]/85">
          NUS Comics &amp; Animation Society — over 25 years of fun and creativity in everything ACG-related. From a small group of friends to a thriving club with hundreds of members and a robust alumni network, this is how we got here.
        </p>
        <span
          className="mt-1 w-full flex items-center justify-center gap-1.5 py-2.5 border text-[10px] font-mono uppercase tracking-widest"
          style={{ borderColor: `${GOLD}66`, color: CREAM }}
        >
          Open the timeline
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    )
  }
  return (
    <>
      <span className="text-[12px] font-mono uppercase tracking-[0.3em]" style={{ color: GOLD }}>
        Our Story
      </span>
      <p className="text-[14px] leading-relaxed max-w-[280px] text-[#f2ead9]/85 text-justify">
        NUS Comics &amp; Animation Society — over 25 years of fun and creativity in everything ACG-related. From a small group friends to a thriving club with hundreds of members and a robust alumni network, this is how we got here.
      </p>
      <span
        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-mono uppercase tracking-widest"
        style={{ borderColor: `${GOLD}66`, color: CREAM }}
      >
        Open the timeline
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </>
  )
}

/**
 * Closed cover that introduces the club and this site, then swings open on click
 * to reveal the timeline behind it. Desktop uses a gatefold (two halves hinged on
 * their outer edges); mobile uses a single left-hinged swing where a gatefold's
 * halves would be too cramped. Once open, the whole layer is click-through so the
 * timeline underneath is fully interactive.
 */
export default function Cover({
  open,
  onOpen,
  isMobile,
}: {
  open: boolean
  onOpen: () => void
  isMobile: boolean
}) {
  const halfBase =
    'absolute top-0 bottom-0 w-1/2 flex flex-col items-center justify-center text-center gap-2.5 px-4 cursor-pointer focus:outline-none'

  return (
    <div
      className={`absolute inset-0 z-30 ${open ? 'pointer-events-none' : 'pointer-events-auto'}`}
      style={{ perspective: 1600 }}
      aria-hidden={open}
    >
      {isMobile ? (
        <button
          type="button"
          onClick={onOpen}
          tabIndex={open ? -1 : 0}
          aria-label="Open the timeline"
          className="absolute inset-0 flex flex-col justify-center gap-4 px-6 cursor-pointer focus:outline-none"
          style={{
            ...FACE,
            transformOrigin: 'left center',
            background: COVER_BG,
            color: CREAM,
            transform: open ? 'rotateY(-165deg)' : 'rotateY(0deg)',
            opacity: open ? 0 : 1,
          }}
        >
          <Identity compact />
          <div className="-mx-6 h-px" style={{ background: `${GOLD}40` }} />
          <Purpose compact />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onOpen}
            tabIndex={open ? -1 : 0}
            aria-label="Open the timeline"
            className={`${halfBase} left-0`}
            style={{
              ...FACE,
              transformOrigin: 'left center',
              background: COVER_BG,
              color: CREAM,
              borderRight: `1px solid ${GOLD}40`,
              transform: open ? 'rotateY(-108deg)' : 'rotateY(0deg)',
              opacity: open ? 0 : 1,
            }}
          >
            <Identity />
          </button>
          <button
            type="button"
            onClick={onOpen}
            tabIndex={open ? -1 : 0}
            aria-label="Open the timeline"
            className={`${halfBase} right-0`}
            style={{
              ...FACE,
              transformOrigin: 'right center',
              background: COVER_BG,
              color: CREAM,
              transform: open ? 'rotateY(108deg)' : 'rotateY(0deg)',
              opacity: open ? 0 : 1,
            }}
          >
            <Purpose />
          </button>
        </>
      )}
    </div>
  )
}

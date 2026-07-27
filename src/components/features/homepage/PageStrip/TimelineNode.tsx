import React from 'react'
import Image from 'next/image'
import type { Milestone } from './milestones'

// Where the continuous timeline rail sits, as a fraction of the card height.
// Content lives above it; the year label sits below it. Because every card uses
// the same value and the rail spans full width, the line reads as one unbroken
// timeline running across all the edge-to-edge cards.
const RAIL_TOP = '81%'

/**
 * One milestone as a portrait "timeline node": a framed image, title and caption
 * stacked above a shared horizontal rail, with the year labelled under the tick.
 * The card supplies its own paper background and top/bottom border; the parent
 * strip manages the vertical separators between cards.
 */
export default function TimelineNode({
  milestone,
  index,
}: {
  milestone: Milestone
  index: number
}) {
  const { year, title, caption, image, imageAlt } = milestone

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#f7f4eb] text-[#1a1616] border-y border-neutral-800 select-none">
      {/* Dot-grid paper texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Continuous timeline rail — full width so it joins across cards */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-[#c9bda0]"
        style={{ top: RAIL_TOP }}
      />
      {/* Tick crossing the rail, plus the node dot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[2px] h-4 bg-[#b9ab8f]"
        style={{ top: `calc(${RAIL_TOP} - 7px)` }}
      />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-[#f7f4eb]"
        style={{ top: RAIL_TOP }}
      />

      {/* Content stacked above the rail */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col items-center text-center px-4 pt-4 pb-3 gap-1.5 md:justify-center"
        style={{ height: RAIL_TOP }}
      >
        <span className="text-[9px] font-mono text-accent uppercase tracking-widest">
          Milestone {String(index + 1).padStart(2, '0')}
        </span>

        {/* Polaroid-style framed image. Mobile fills spare height; desktop pins a
            square 1:1 frame. */}
        <div className="relative w-full max-w-[170px] md:max-w-[220px] flex-1 min-h-0 md:flex-none md:aspect-square my-1">
          <div className="w-full h-full bg-white border border-[#dcd1ba] p-1.5 shadow-sm">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={image}
                alt={imageAlt ?? title}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>
        </div>

        <p className="text-xl font-display leading-tight">{title}</p>
        <p className="text-[12px] text-[#685f5d] max-w-[260px] line-clamp-3">
          {caption}
        </p>
      </div>

      {/* Year label below the rail */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-start pt-3.5"
        style={{ top: RAIL_TOP }}
      >
        <span className="text-3xl font-serif tracking-wide leading-none text-[#1a1616]/85">
          {year}
        </span>
      </div>
    </div>
  )
}

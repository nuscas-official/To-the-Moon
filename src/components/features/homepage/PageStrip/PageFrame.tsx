import React from 'react'
import Image from 'next/image'
import { USE_SLIDE_IMAGES } from './config'

export type PageSide = 'left' | 'right'

export interface PageFrameProps {
  /** Which edge the page sits on in a spread. Drives the accent line, border and
   *  page-number alignment (left pages read left-aligned, right pages right). */
  side: PageSide
  /** Zero-padded label shown in the footer, e.g. "01". */
  pageNumber: string
  /** Top block of the page (eyebrow + heading). */
  header: React.ReactNode
  /** Extra classes for the middle body wrapper (already gets `relative <pad> my-auto`). */
  bodyClassName?: string
  /** Middle body content. */
  children: React.ReactNode
  /** Full-bleed image used when USE_SLIDE_IMAGES is on. */
  slide?: { src: string; alt: string }
  /** Interactive overlay rendered on top of the slide image (buttons, hotspots). */
  slideOverlay?: React.ReactNode
}

/**
 * Shared chrome for every page: the paper background, dot-grid texture, the thin
 * accent rule, the page-number footer and the spread border. Individual pages
 * supply only their own header and body. When USE_SLIDE_IMAGES is enabled the
 * frame swaps to the full-bleed image (plus any interactive overlay).
 */
export default function PageFrame({
  side,
  pageNumber,
  header,
  bodyClassName = '',
  children,
  slide,
  slideOverlay,
}: PageFrameProps) {
  const borderSide = side === 'left' ? 'border-l' : 'border-r'
  const pad = side === 'left' ? 'pl-4' : 'pr-4'

  if (USE_SLIDE_IMAGES && slide) {
    return (
      <div className={`w-full h-full relative overflow-hidden border-y ${borderSide} border-neutral-800`}>
        <Image src={slide.src} alt={slide.alt} fill className="object-cover" />
        {slideOverlay}
      </div>
    )
  }

  return (
    <div className={`w-full h-full flex flex-col justify-between p-6 bg-[#f7f4eb] text-[#1a1616] relative overflow-hidden border-y ${borderSide} border-neutral-800`}>
      {/* Dot-grid paper texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(26, 22, 22, 1) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      {/* Thin accent rule down the spine edge */}
      <div className={`absolute ${side === 'left' ? 'left-6' : 'right-6'} top-6 bottom-6 w-[1px] bg-[#dcd1ba]/40`} />

      <div className={`relative ${pad}`}>{header}</div>

      <div className={`relative ${pad} my-auto ${bodyClassName}`}>{children}</div>

      <div className={`relative ${pad} ${side === 'right' ? 'flex justify-end' : ''} text-[9px] font-mono text-[#685f5d]`}>
        [ PAGE {pageNumber} ]
      </div>
    </div>
  )
}

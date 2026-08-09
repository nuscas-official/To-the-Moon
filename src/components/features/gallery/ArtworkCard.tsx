'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface Artwork {
  id: string
  storage_key: string
  title: string | null
  artist_credit: string
}

interface ArtworkCardProps {
  artwork: Artwork
  variant?: 'marquee' | 'masonry'
  onZoomToggle?: (zoomed: boolean) => void
}

export default function ArtworkCard({ artwork, variant = 'masonry', onZoomToggle }: ArtworkCardProps) {
  const isMarquee = variant === 'marquee'
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')

  const [startCoords, setStartCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  const [targetCoords, setTargetCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const imgRef = useRef<HTMLImageElement>(null)

  const isOpen = animationState !== 'closed'
  const isTransitionOpen = animationState === 'open'

  // Trigger opening sequence
  const handleOpen = () => {
    if (!imgRef.current) return

    // Get the exact coordinates of the clicked thumbnail image
    const rect = imgRef.current.getBoundingClientRect()
    setStartCoords({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    })

    // Calculate aspect ratio and target centered overlay size
    const naturalWidth = imgRef.current.naturalWidth || rect.width
    const naturalHeight = imgRef.current.naturalHeight || rect.height
    const imageRatio = naturalWidth / naturalHeight

    const maxW = window.innerWidth * 0.90
    const maxH = window.innerHeight * 0.70

    let targetW = maxW
    let targetH = maxW / imageRatio

    if (targetH > maxH) {
      targetH = maxH
      targetW = maxH * imageRatio
    }

    const targetLeft = (window.innerWidth - targetW) / 2
    const targetTop = (window.innerHeight - targetH) / 2

    setTargetCoords({
      top: targetTop,
      left: targetLeft,
      width: targetW,
      height: targetH
    })

    setAnimationState('opening')
    onZoomToggle?.(true)
    document.body.style.overflow = 'hidden'
  }

  // Trigger closing sequence
  const handleClose = () => {
    setAnimationState('closing')
  }

  // Orchestrate entry and exit animations
  useEffect(() => {
    if (animationState === 'opening') {
      const timer = setTimeout(() => {
        void document.body.offsetHeight // Force reflow to commit layout changes
        setAnimationState('open')
      }, 30)
      return () => clearTimeout(timer)
    } else if (animationState === 'closing') {
      const timer = setTimeout(() => {
        setAnimationState('closed')
        onZoomToggle?.(false)
        document.body.style.overflow = ''
      }, 350) // Transition duration plus buffer to guarantee completion
      return () => clearTimeout(timer)
    }
  }, [animationState, onZoomToggle])

  // Prevent scroll lock leaks
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Listen to Escape key press to close lightbox when it is active
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Determine inline styles for the zooming image
  const useCoords = startCoords && targetCoords
  const zoomImgStyle: React.CSSProperties = useCoords
    ? {
        position: 'absolute',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        top: isTransitionOpen ? `${targetCoords.top}px` : `${startCoords.top}px`,
        left: isTransitionOpen ? `${targetCoords.left}px` : `${startCoords.left}px`,
        width: isTransitionOpen ? `${targetCoords.width}px` : `${startCoords.width}px`,
        height: isTransitionOpen ? `${targetCoords.height}px` : `${startCoords.height}px`,
        // Match how each thumbnail renders inside its box so the zoom starts on the same framing:
        // masonry letterboxes a capped-height image, marquee crops to a 4:3 tile. The target box
        // is built from the natural ratio, so both resolve identically once open.
        objectFit: isMarquee ? 'cover' : 'contain'
      }
    : {}

  // Metadata fade classes
  const metadataClasses = isTransitionOpen
    ? 'opacity-100 translate-y-0 transition-all duration-300 delay-100'
    : 'opacity-0 translate-y-4 transition-all duration-150'

  return (
    <>
      {/* 1. Thumbnail Card */}
      <div
        onClick={handleOpen}
        className={
          isMarquee
            ? "relative flex-shrink-0 w-60 sm:w-72 aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface cursor-zoom-in group shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 active:scale-98 hover:-translate-y-1"
            : "break-inside-avoid relative group border border-border bg-surface overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-zoom-in hover:-translate-y-0.5 active:scale-[0.99] mb-6 w-full"
        }
      >
        {/* Image Container & Image */}
        {isMarquee ? (
          <Image
            ref={imgRef}
            src={artwork.storage_key}
            alt={artwork.title || `Artwork by ${artwork.artist_credit}`}
            fill
            sizes="(max-width: 640px) 240px, 288px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="relative w-full h-auto overflow-hidden [container-type:inline-size]">
            {/* Cap tile height at 1.15x the column width so very tall artwork can't dominate a
                masonry column. Nothing is cropped -- object-contain scales a too-tall piece down
                to fit, leaving it narrower and centred against the card. The box keeps its full
                column width so the height/width attributes still reserve space before load;
                sizing the element itself to the image instead would collapse the tile to zero and
                reflow the whole grid on load. cqw keeps the cap proportional as the column
                resizes, instead of drifting between breakpoints the way fixed px caps would. */}
            <Image
              ref={imgRef}
              src={artwork.storage_key}
              alt={artwork.title || `Artwork by ${artwork.artist_credit}`}
              width={500}
              height={500}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="w-full h-auto max-h-[115cqw] object-contain transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          </div>
        )}

        {/* Overlay details */}
        {isMarquee ? (
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between">
              <div className="pr-4 text-left">
                <h4 className="text-white font-bold text-sm tracking-tight line-clamp-1">
                  {artwork.title || <span className="italic font-normal opacity-85">Untitled</span>}
                </h4>
                <p className="text-neutral-300 text-xs mt-0.5">
                  By <span className="text-white font-medium">{artwork.artist_credit}</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 21l7-7" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-accent animate-fade-in-up">
              Artwork
            </span>
            <h3 className="text-white font-black text-lg tracking-tight mt-0.5 leading-snug break-words">
              {artwork.title || <span className="italic font-normal opacity-80">Untitled</span>}
            </h3>
            <p className="text-neutral-300 text-xs mt-1">
              By <span className="font-bold text-white">{artwork.artist_credit}</span>
            </p>
          </div>
        )}
      </div>

      {/* 2. Lightbox Modal Portal (Rendered directly to body) */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-zoom-out"
            onClick={handleClose}
          >
            {/* Backdrop Overlay (fades out while image stays opaque) */}
            <div
              className={`absolute inset-0 transition-all duration-300 ease-out -z-10 ${
                isTransitionOpen
                  ? 'bg-black/90 backdrop-blur-md opacity-100'
                  : 'bg-black/0 backdrop-blur-none opacity-0'
              }`}
            />

            {/* Close & Key Indicator Group */}
            <div
              className={`absolute top-6 right-6 z-50 flex items-center gap-2.5 transition-all duration-200 ${
                isTransitionOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <button
                onClick={handleClose}
                className="hidden md:inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 hover:border-white/50 rounded-lg shadow-md transition-all active:scale-95 outline-none cursor-pointer"
                title="Press Escape key to exit"
                aria-label="Exit lightbox with Escape key"
              >
                <kbd className="font-mono font-black text-[11px] uppercase tracking-wider text-white">ESC</kbd>
              </button>

              <button
                onClick={handleClose}
                className="text-white hover:text-accent bg-white/10 hover:bg-white/20 p-2.5 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-200 cursor-pointer"
                title="Close"
                aria-label="Close lightbox"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Zooming Image Element */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artwork.storage_key}
              alt={artwork.title || 'Full size artwork'}
              style={zoomImgStyle}
              className={`border border-white/10 shadow-2xl z-40 select-none cursor-zoom-out ${
                !useCoords ? 'max-h-[70vh] max-w-[90vw] md:max-w-[80vw] object-contain my-auto' : ''
              }`}
            />

            {/* Lightbox Metadata details */}
            {targetCoords && (
              <div
                className="absolute left-1/2 -translate-x-1/2 text-center max-w-lg space-y-1 z-40 pointer-events-none select-none"
                style={{
                  top: `${targetCoords.top + targetCoords.height + 24}px`
                }}
              >
                <div className={metadataClasses}>
                  <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    {artwork.title || <span className="italic font-normal text-neutral-400">Untitled</span>}
                  </h2>
                  <p className="text-neutral-400 text-sm">
                    Created by <span className="text-accent font-extrabold">{artwork.artist_credit}</span>
                  </p>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

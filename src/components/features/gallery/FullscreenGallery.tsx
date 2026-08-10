'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ArtworkCard from './ArtworkCard'
import {
  GAP,
  rowHeight,
  rowHeightStyle,
  useAspectRatios,
  useContainerWidth,
  type Artwork,
  type MeasuredArtwork,
  type Row,
} from './justified-layout'

/**
 * EXPERIMENTAL -- kiosk mode for the gallery page.
 *
 * A vertical counterpart to the homepage's horizontal RollingGallery: the same justified rows the
 * gallery page uses (so every piece keeps its own dimensions), looping upward forever on a
 * full-screen canvas. Built for unattended display -- a laptop on a table at an event booth.
 *
 * Deliberately self-contained: the whole feature is this file plus one <FullscreenGalleryButton />
 * in src/app/gallery/page.tsx. Deleting those two things removes it without touching the gallery.
 * Nothing here mounts until the button is pressed, so the normal page pays no cost for it.
 */

/** Scroll speed in CSS px per second. */
const DEFAULT_SPEED = 55
const MIN_SPEED = 15
const MAX_SPEED = 165
const SPEED_STEP = 25

/** Controls and cursor fade out after this long without input, so the display stays clean. */
const IDLE_MS = 2600

/** Rows are sized off the viewport height, so a big screen shows bigger art, not more of it. */
function targetRowHeight(viewportHeight: number) {
  return Math.max(200, Math.min(520, viewportHeight * 0.4))
}

/**
 * Builds one loop's worth of rows, cycling through the artworks as many times as it takes to
 * overflow the screen. Unlike the page layout this never emits a partial row -- the loop only stops
 * on a row that filled up, so the seam where the block repeats is indistinguishable from any other
 * row boundary. It also never stops before every artwork has appeared at least once.
 */
function buildLoopRows(
  items: MeasuredArtwork[],
  containerWidth: number,
  target: number,
  minHeight: number
): Row[] {
  if (items.length === 0 || containerWidth <= 0) return []

  const MAX_ROWS = 300
  const rows: Row[] = []
  let current: MeasuredArtwork[] = []
  let ratioSum = 0
  let height = 0
  let consumed = 0

  while (rows.length < MAX_ROWS) {
    const item = items[consumed % items.length]
    consumed++
    current.push(item)
    ratioSum += item.ratio

    const gapTotal = GAP * (current.length - 1)
    if ((containerWidth - gapTotal) / ratioSum <= target) {
      const row: Row = { items: current, ratioSum, gapTotal, partial: false }
      rows.push(row)
      height += rowHeight(row, containerWidth, target) + GAP
      current = []
      ratioSum = 0
      if (height >= minHeight && consumed >= items.length) break
    }
  }

  return rows
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface FullscreenGalleryProps {
  artworks: Artwork[]
  /** Small standing label in the corner, for a booth display. */
  caption?: string
}

/** The entry point: a button that mounts the kiosk overlay on demand. */
export default function FullscreenGalleryButton({ artworks, caption }: FullscreenGalleryProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  if (artworks.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 self-start border border-border bg-surface px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-text-muted transition-colors hover:border-accent hover:text-accent sm:self-end"
        title="Loop the gallery full screen -- for displays and event booths"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
        Display mode
      </button>

      {open && <FullscreenGalleryOverlay artworks={artworks} caption={caption} onClose={close} />}
    </>
  )
}

function FullscreenGalleryOverlay({
  artworks,
  caption,
  onClose,
}: FullscreenGalleryProps & { onClose: () => void }) {
  const { ref: stageRef, width } = useContainerWidth<HTMLDivElement>()
  const { ratios, ready } = useAspectRatios(artworks)

  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight)
  const [paused, setPaused] = useState(prefersReducedMotion)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const [chromeVisible, setChromeVisible] = useState(true)

  const trackRef = useRef<HTMLDivElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  /** How far the track has travelled, in px. Driven per-frame outside React to stay off the render path. */
  const offsetRef = useRef(0)
  /** Block height + the gap that follows it: the distance after which the track has looped once. */
  const cycleRef = useRef(0)
  /** A lightbox is open, so the scroll pauses and Escape belongs to the lightbox, not to us. */
  const zoomedRef = useRef(false)

  const target = targetRowHeight(viewportHeight)

  const rows = useMemo(() => {
    if (!width || !ready) return []
    const measured = artworks.map((artwork) => ({ artwork, ratio: ratios[artwork.id] ?? 1 }))
    // 1.25 screens of art guarantees the second copy is always ready below the fold.
    return buildLoopRows(measured, width, target, viewportHeight * 1.25)
  }, [artworks, ratios, ready, width, target, viewportHeight])

  // Track the viewport height so rows re-justify when the window (or the fullscreen state) changes.
  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Ask for real fullscreen on the document (not on the overlay) so ArtworkCard's lightbox, which
  // portals to <body>, still renders above us. Failure is fine -- the fixed overlay already covers
  // the screen; we just keep the browser chrome.
  useEffect(() => {
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {})
    return () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  // Leaving fullscreen (Esc, F11, the browser's own affordance) means "I'm done" -- unless a
  // lightbox is open, in which case Escape was aimed at that.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && !zoomedRef.current) onClose()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Keep the laptop awake -- the whole point is an unattended display.
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null
    let done = false

    const acquire = async () => {
      try {
        // Optional chaining because the API is missing entirely outside secure/supported contexts.
        const lock = await navigator.wakeLock?.request('screen')
        if (done) void lock?.release().catch(() => {})
        else sentinel = lock ?? null
      } catch {
        // Unsupported, or denied because the tab is hidden. Not worth surfacing.
      }
    }

    // The lock is dropped whenever the tab is backgrounded, so take it again on return.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      done = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release().catch(() => {})
    }
  }, [])

  // Measure one block so the track can wrap by exactly one copy.
  useEffect(() => {
    const el = blockRef.current
    if (!el) return
    const measure = () => {
      cycleRef.current = el.getBoundingClientRect().height + GAP
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [rows])

  // The scroll itself. Transform is written straight to the node: no state, no re-render per frame.
  useEffect(() => {
    if (paused || rows.length === 0) return

    let frame = 0
    let last = performance.now()

    const step = (now: number) => {
      // Clamp the delta so a backgrounded tab doesn't resume with one enormous jump.
      const delta = Math.min(now - last, 100) / 1000
      last = now

      const cycle = cycleRef.current
      if (cycle > 0) {
        const next = (offsetRef.current + speed * delta) % cycle
        offsetRef.current = next
        if (trackRef.current) trackRef.current.style.transform = `translate3d(0, ${-next}px, 0)`
      }

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [paused, speed, rows.length])

  // Controls and cursor retreat when nobody is touching the machine.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const wake = () => {
      setChromeVisible(true)
      clearTimeout(timer)
      timer = setTimeout(() => setChromeVisible(false), IDLE_MS)
    }
    wake()
    window.addEventListener('mousemove', wake)
    window.addEventListener('pointerdown', wake)
    window.addEventListener('keydown', wake)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [])

  const nudgeSpeed = useCallback((direction: 1 | -1) => {
    setSpeed((current) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, current + direction * SPEED_STEP)))
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (zoomedRef.current) return // The lightbox owns the keyboard while it's open.
      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case ' ':
          event.preventDefault()
          setPaused((p) => !p)
          break
        case 'ArrowUp':
          event.preventDefault()
          nudgeSpeed(1)
          break
        case 'ArrowDown':
          event.preventDefault()
          nudgeSpeed(-1)
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, nudgeSpeed])

  const handleZoomToggle = useCallback((zoomed: boolean) => {
    zoomedRef.current = zoomed
    setPaused(zoomed)
    // ArtworkCard clears the body scroll lock when its lightbox closes; the overlay still needs it.
    if (!zoomed) document.body.style.overflow = 'hidden'
  }, [])

  const loading = rows.length === 0

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] bg-background ${chromeVisible ? '' : 'cursor-none'}`}
      role="region"
      aria-label="Gallery display mode"
    >
      {/* The moving canvas. container-type makes 100cqw in the row heights resolve to this width. */}
      <div ref={stageRef} className="absolute inset-0 overflow-hidden px-4 [container-type:inline-size]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="animate-pulse font-display text-sm uppercase tracking-[0.3em] text-text-muted">
              Loading gallery
            </span>
          </div>
        ) : (
          <div ref={trackRef} className="flex flex-col will-change-transform" style={{ gap: `${GAP}px` }}>
            {/* Two identical copies; the track wraps by exactly one, so the loop has no seam. */}
            {[0, 1].map((copy) => (
              <div
                key={copy}
                ref={copy === 0 ? blockRef : undefined}
                aria-hidden={copy === 1}
                className="flex flex-col"
                style={{ gap: `${GAP}px` }}
              >
                {rows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex"
                    style={{ gap: `${GAP}px`, height: rowHeightStyle(row, target) }}
                  >
                    {row.items.map(({ artwork, ratio }, itemIndex) => (
                      <div
                        key={`${rowIndex}-${itemIndex}-${artwork.id}`}
                        className="h-full flex-none"
                        style={{ aspectRatio: String(ratio) }}
                      >
                        <ArtworkCard artwork={artwork} variant="justified" onZoomToggle={handleZoomToggle} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soft edges, so art enters and leaves instead of being sliced off. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      {caption && (
        <div className="pointer-events-none absolute bottom-5 left-6 select-none">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-text-muted/70">{caption}</span>
        </div>
      )}

      <div
        className={`absolute right-5 top-5 flex items-center gap-2 transition-opacity duration-500 ${
          chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <ControlButton
          onClick={() => nudgeSpeed(-1)}
          disabled={speed <= MIN_SPEED}
          label="Slow down (Down arrow)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </ControlButton>

        <span className="min-w-[3.5rem] text-center font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {Math.round((speed / DEFAULT_SPEED) * 10) / 10}&times;
        </span>

        <ControlButton onClick={() => nudgeSpeed(1)} disabled={speed >= MAX_SPEED} label="Speed up (Up arrow)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </ControlButton>

        <ControlButton onClick={() => setPaused((p) => !p)} label={paused ? 'Resume (Space)' : 'Pause (Space)'}>
          {paused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M7 4l13 8-13 8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </ControlButton>

        <ControlButton onClick={onClose} label="Exit display mode (Escape)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </ControlButton>
      </div>
    </div>,
    document.body
  )
}

function ControlButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void
  label: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center border border-border bg-surface/80 text-text-muted backdrop-blur-md transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

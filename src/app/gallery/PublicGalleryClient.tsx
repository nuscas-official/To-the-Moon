'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ArtworkCard from '@/components/features/gallery/ArtworkCard'

interface Artwork {
  id: string;
  storage_key: string;
  title: string | null;
  artist_credit: string;
}

interface PublicGalleryClientProps {
  artworks: Artwork[];
}

const GAP = 16

// Rows close once they fit within this height, so it doubles as the cap on how large any single
// artwork can render. Smaller viewports get shorter rows to keep a few pieces per row.
function targetRowHeight(containerWidth: number) {
  if (containerWidth < 480) return 190
  if (containerWidth < 768) return 230
  if (containerWidth < 1100) return 270
  return 310
}

// Give up waiting on a stubborn image so one bad URL can't hold the whole gallery on the skeleton.
const MEASURE_TIMEOUT_MS = 3000

interface MeasuredArtwork {
  artwork: Artwork
  ratio: number
}

interface Row {
  items: MeasuredArtwork[]
  /** Sum of the row's aspect ratios; the row's own width:height ratio once gaps are removed. */
  ratioSum: number
  gapTotal: number
  /** A trailing row that never filled up, so it must not be stretched to full width. */
  partial: boolean
}

/**
 * Greedy justified grouping: keep adding artworks to a row until scaling it to the container width
 * would bring its height down to the target, then commit it.
 *
 * This only decides *which* pieces share a row. The actual sizes are derived in CSS from the row's
 * real width, so a stale or approximate containerWidth here costs nothing more than a slightly
 * taller or shorter row -- it can never distort a piece.
 */
function buildRows(items: MeasuredArtwork[], containerWidth: number, target: number): Row[] {
  const rows: Row[] = []
  let current: MeasuredArtwork[] = []
  let ratioSum = 0

  const commit = (partial: boolean) => {
    rows.push({ items: current, ratioSum, gapTotal: GAP * (current.length - 1), partial })
    current = []
    ratioSum = 0
  }

  for (const item of items) {
    current.push(item)
    ratioSum += item.ratio
    const available = containerWidth - GAP * (current.length - 1)
    if (available / ratioSum <= target) commit(false)
  }

  if (current.length) commit(true)

  return rows
}

/**
 * Row height as pure CSS: (row width - gaps) / sum of aspect ratios, where 100cqw is the gallery's
 * own width. Each tile then takes its natural aspect-ratio at that height, so a full row fills the
 * width exactly at any size -- no flex shrinking, no rounding gaps, and no dependence on JS having
 * an up-to-date width. A partial row is capped at the target height instead of being blown up.
 */
function rowHeightStyle(row: Row, target: number) {
  const exact = `calc((100cqw - ${row.gapTotal}px) / ${row.ratioSum.toFixed(4)})`
  return row.partial ? `min(${exact}, ${target}px)` : exact
}

/** Resolves each artwork's aspect ratio by loading it; falls back to square on error or timeout. */
function useAspectRatios(artworks: Artwork[]) {
  const key = artworks.map((a) => a.id).join(',')
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    setRatios({})
    setTimedOut(false)

    artworks.forEach((artwork) => {
      const probe = new window.Image()
      const resolve = (ratio: number) => {
        if (!cancelled) setRatios((prev) => ({ ...prev, [artwork.id]: ratio }))
      }
      probe.onload = () => resolve(probe.naturalHeight ? probe.naturalWidth / probe.naturalHeight : 1)
      probe.onerror = () => resolve(1)
      probe.src = artwork.storage_key
    })

    const timer = setTimeout(() => {
      if (!cancelled) setTimedOut(true)
    }, MEASURE_TIMEOUT_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const ready = timedOut || artworks.every((a) => ratios[a.id] !== undefined)
  return { ratios, ready }
}

/** Tracks the container's width so rows re-justify on resize. */
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

export default function PublicGalleryClient({ artworks }: PublicGalleryClientProps) {
  const { ref, width } = useContainerWidth()
  const { ratios, ready } = useAspectRatios(artworks)

  const rows = useMemo(() => {
    if (!width || !ready) return []
    const measured = artworks.map((artwork) => ({ artwork, ratio: ratios[artwork.id] ?? 1 }))
    return buildRows(measured, width, targetRowHeight(width))
  }, [artworks, ratios, ready, width])

  if (artworks.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface">
        <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-bold text-neutral-600">No artwork in the gallery yet</h3>
        <p className="text-sm text-text-muted mt-1">Check back later or submit your designs if you are a member!</p>
      </div>
    )
  }

  const target = targetRowHeight(width || 1280)

  return (
    // Establishes the container the rows measure themselves against with 100cqw.
    <div ref={ref} className="[container-type:inline-size]">
      {rows.length === 0 ? (
        <GallerySkeleton count={artworks.length} height={target} />
      ) : (
        <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ gap: `${GAP}px`, height: rowHeightStyle(row, target) }}>
              {row.items.map(({ artwork, ratio }) => (
                // flex-none plus aspect-ratio: width follows the artwork's shape from the row
                // height, so flexbox can never shrink a tile out of proportion.
                <div key={artwork.id} className="h-full flex-none" style={{ aspectRatio: String(ratio) }}>
                  <ArtworkCard artwork={artwork} variant="justified" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Placeholder shown while aspect ratios resolve, so the page doesn't jump from empty to full. */
function GallerySkeleton({ count, height }: { count: number; height: number }) {
  return (
    <div className="flex flex-wrap" style={{ gap: `${GAP}px` }}>
      {Array.from({ length: Math.min(count, 9) }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-xl bg-surface border border-border animate-pulse"
          // Vary the basis so the placeholder hints at the irregular rows that follow.
          style={{ height: `${height}px`, minWidth: `${140 + ((i * 37) % 90)}px` }}
        />
      ))}
    </div>
  )
}

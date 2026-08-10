'use client'

import { useMemo } from 'react'
import ArtworkCard from '@/components/features/gallery/ArtworkCard'
import {
  GAP,
  buildRows,
  rowHeightStyle,
  useAspectRatios,
  useContainerWidth,
  type Artwork,
} from '@/components/features/gallery/justified-layout'

interface PublicGalleryClientProps {
  artworks: Artwork[];
}

// Rows close once they fit within this height, so it doubles as the cap on how large any single
// artwork can render. Smaller viewports get shorter rows to keep a few pieces per row.
function targetRowHeight(containerWidth: number) {
  if (containerWidth < 480) return 190
  if (containerWidth < 768) return 230
  if (containerWidth < 1100) return 270
  return 310
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

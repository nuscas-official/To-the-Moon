'use client'

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

export default function PublicGalleryClient({ artworks }: PublicGalleryClientProps) {
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

  return (
    <div>
      {/* Masonry Columns Layout */}
      <div className="columns-2 md:columns-3 lg:columns-3 gap-4 space-y-6">
        {artworks.map((art) => (
          <ArtworkCard
            key={art.id}
            artwork={art}
            variant="masonry"
          />
        ))}
      </div>
    </div>
  )
}

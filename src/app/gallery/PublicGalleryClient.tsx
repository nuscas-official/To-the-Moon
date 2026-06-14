'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

  // Listen to Escape key press to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArtwork(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {artworks.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArtwork(art)}
            className="break-inside-avoid relative group rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] chaos-card-active"
          >
            {/* Image Container */}
            <div className="relative w-full h-auto overflow-hidden">
              <Image
                src={art.storage_key}
                alt={art.title || `Artwork by ${art.artist_credit}`}
                width={500}
                height={500}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized // Ensure local mock relative urls render without sharp next/image limits locally
              />
            </div>

            {/* Hover Text overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-accent animate-fade-in-up">
                Artwork
              </span>
              <h3 className="text-white font-black text-lg tracking-tight mt-0.5 leading-snug break-words">
                {art.title || <span className="italic font-normal opacity-80">Untitled</span>}
              </h3>
              <p className="text-neutral-300 text-xs mt-1">
                By <span className="font-bold text-white">{art.artist_credit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Dialog Modal */}
      {selectedArtwork && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedArtwork(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedArtwork(null)}
            className="absolute top-6 right-6 text-white hover:text-accent bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all active:scale-90"
            title="Close (Esc)"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Container */}
          <div 
            className="relative max-w-5xl max-h-[80vh] flex flex-col items-center p-4"
            onClick={(e) => e.stopPropagation()} // block closing when clicking the image
          >
            <div className="relative max-h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArtwork.storage_key}
                alt={selectedArtwork.title || 'Full size artwork'}
                className="max-h-[70vh] max-w-[90vw] object-contain rounded-xl border border-white/10 shadow-2xl animate-scale-up"
              />
            </div>

            {/* Lightbox Metadata details */}
            <div className="mt-6 text-center max-w-lg space-y-1">
              <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {selectedArtwork.title || <span className="italic font-normal text-neutral-400">Untitled</span>}
              </h2>
              <p className="text-neutral-400 text-sm">
                Created by <span className="text-accent font-extrabold">{selectedArtwork.artist_credit}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

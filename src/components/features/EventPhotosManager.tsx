'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { addEventPhotoAction, deleteEventPhotoAction, reorderEventPhotosAction } from '@/server/actions/events'

interface EventPhoto {
  id: string;
  storage_key: string;
  alt_text: string | null;
  display_order: number;
}

interface EventPhotosManagerProps {
  eventId: string;
  initialPhotos: EventPhoto[];
}

export default function EventPhotosManager({ eventId, initialPhotos }: EventPhotosManagerProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState<EventPhoto[]>(
    [...initialPhotos].sort((a, b) => a.display_order - b.display_order)
  )

  // Add photo states
  const [file, setFile] = useState<File | null>(null)
  const [newAltText, setNewAltText] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  // 1. Add Photo Handler
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please select an image file.')
      return
    }

    setAdding(true)
    try {
      // Compress file client-side using canvas WebP conversion
      const { compressImageClient } = await import('@/lib/image-client')
      const compressedFile = await compressImageClient(file)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('folder', 'events')

      const res = await fetch('/api/uploads/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      const result = await addEventPhotoAction(eventId, data.url, newAltText)
      
      if (result.success && result.photo) {
        setPhotos(prev => [...prev, result.photo as EventPhoto])
        setFile(null)
        setNewAltText('')
        
        const fileInput = document.getElementById('photo_file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        router.refresh()
      } else {
        setError(result.error || 'Failed to add photo.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setAdding(false)
    }
  }

  // 2. Delete Photo Handler
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to remove this photo from the event?')) {
      return
    }

    try {
      const result = await deleteEventPhotoAction(photoId, eventId)
      if (result.success) {
        setPhotos(prev => prev.filter(p => p.id !== photoId))
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete photo.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  // 3. HTML5 Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Reorder state array optimistically on hover
    const reorderedPhotos = [...photos]
    const draggedItem = reorderedPhotos[draggedIndex]
    reorderedPhotos.splice(draggedIndex, 1)
    reorderedPhotos.splice(index, 0, draggedItem)
    
    setPhotos(reorderedPhotos)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)
    
    setIsUpdatingOrder(true)
    try {
      const photoIds = photos.map(p => p.id)
      const result = await reorderEventPhotosAction(eventId, photoIds)
      
      if (!result.success) {
        alert(result.error || 'Failed to persist photo order.')
        // Re-fetch original order if save fails
        router.refresh()
      }
    } catch (err) {
      console.error('Drag end order update error:', err)
    } finally {
      setIsUpdatingOrder(false)
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Photo Form Wrapper */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-sm uppercase tracking-wider font-extrabold text-neutral-500 mb-4">
          Add Photo to Gallery
        </h3>
        
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddPhoto} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo File Input */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="photo_file" className="text-[10px] uppercase font-black tracking-wider text-neutral-400">
                Choose Photo Image <span className="text-red-500">*</span>
              </label>
              <input
                id="photo_file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                required
              />
            </div>

            {/* Alt Text */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="alt_text" className="text-[10px] uppercase font-black tracking-wider text-neutral-400">
                Caption / Description Text
              </label>
              <input
                id="alt_text"
                type="text"
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                placeholder="e.g. Group picture during welcoming game"
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adding || !file}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95 disabled:opacity-50"
            >
              {adding ? 'Uploading...' : '+ Add Photo to Gallery'}
            </button>
          </div>
        </form>
      </div>

      {/* Photo Gallery Reordering Grid */}
      <div>
        <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-neutral-500">
              Manage Photo Gallery
            </h3>
            <p className="text-[10px] text-text-muted mt-1">
              Drag and drop cards to reorder them in the gallery. Changes persist automatically.
            </p>
          </div>
          {isUpdatingOrder && (
            <span className="text-[10px] text-accent font-bold animate-pulse">
              Updating order...
            </span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-6">
            <p className="text-xs text-text-muted">No photos in this event gallery yet. Add some above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((photo, index) => {
              const isDragging = draggedIndex === index

              return (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative h-40 rounded-xl border overflow-hidden bg-neutral-100 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                    isDragging 
                      ? 'border-accent ring-2 ring-accent opacity-50 scale-95' 
                      : 'border-border hover:border-accent/40'
                  }`}
                >
                  {/* Photo Image */}
                  <Image
                    src={photo.storage_key}
                    alt={photo.alt_text || ''}
                    fill
                    unoptimized
                    className="object-cover pointer-events-none"
                  />

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 left-2 bg-neutral-900/60 backdrop-blur rounded px-1.5 py-0.5 text-[8px] font-black uppercase text-white tracking-widest pointer-events-none opacity-80">
                    Order: {index + 1}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete photo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Alt Text Label */}
                  {photo.alt_text && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white truncate pointer-events-none">
                      {photo.alt_text}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

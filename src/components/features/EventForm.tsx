'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface EventInput {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
}

interface EventFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string | null;
    location: string | null;
    status: 'upcoming' | 'past' | 'cancelled';
    cover_image_key: string | null;
  };
  onSave: (input: EventInput) => Promise<{ success: boolean; error?: string; id?: string }>;
}

// Helper to convert ISO string to YYYY-MM-DDTHH:MM for datetime-local input
function formatToDateTimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    
    // Format as YYYY-MM-DDTHH:MM in local timezone
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}

export default function EventForm({ initialData, onSave }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  // Form states
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startsAt, setStartsAt] = useState(formatToDateTimeLocal(initialData?.starts_at))
  const [endsAt, setEndsAt] = useState(formatToDateTimeLocal(initialData?.ends_at))
  const [location, setLocation] = useState(initialData?.location || '')
  const [status, setStatus] = useState<'upcoming' | 'past' | 'cancelled'>(initialData?.status || 'upcoming')
  const [coverImageKey, setCoverImageKey] = useState(initialData?.cover_image_key || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Compressing & uploading...')
    setError(null)

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

      setCoverImageKey(data.url)
      setUploadProgress(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover image')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveCover = () => {
    setCoverImageKey('')
    setUploadProgress(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!startsAt) {
      setError('Start date and time is required.')
      return
    }

    setLoading(true)

    try {
      const startsAtISO = new Date(startsAt).toISOString()
      const endsAtISO = endsAt ? new Date(endsAt).toISOString() : null

      const result = await onSave({
        title,
        description: description.trim() || null,
        starts_at: startsAtISO,
        ends_at: endsAtISO,
        location: location.trim() || null,
        status,
        cover_image_key: coverImageKey.trim() || null,
      })

      if (result.success) {
        // Optimistic UX: if creating, go to edit page to allow adding photos; if editing, go back to list
        if (!isEdit && result.id) {
          router.push(`/admin/events/edit/${result.id}`)
        } else {
          router.push('/admin/events')
        }
        router.refresh()
      } else {
        setError(result.error || 'Something went wrong.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl text-left">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="title" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Welcome Tea & Summer Screening"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="description" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail what the event is about, schedule, snacks, or special requirements..."
          rows={5}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-y"
        />
      </div>

      {/* Date and Time Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Starts At */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="starts_at" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Starts At <span className="text-red-500">*</span>
          </label>
          <input
            id="starts_at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
            required
          />
        </div>

        {/* Ends At */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="ends_at" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Ends At (Optional)
          </label>
          <input
            id="ends_at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
        </div>
      </div>

      {/* Location and Status Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="location" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. LT19, UTown SR3, or Online"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="status" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'upcoming' | 'past' | 'cancelled')}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Cover Image Upload */}
      <div className="flex flex-col space-y-1.5">
        <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
          Cover Image
        </span>
        {coverImageKey ? (
          <div className="relative h-60 w-full rounded-xl border border-border bg-neutral-100 overflow-hidden group">
            <Image fill unoptimized src={coverImageKey} alt="Cover image preview" className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRemoveCover}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Remove Cover
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-xl p-8 bg-surface flex flex-col items-center justify-center text-center hover:border-accent transition-colors relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <svg className="w-10 h-10 text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-neutral-700">
              {uploading ? uploadProgress : 'Click or drag image to upload'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports JPEG, PNG, WEBP, GIF up to 10MB (automatically resized to 2000px and compressed)
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Event Details' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

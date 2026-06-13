'use client'

import { useState } from 'react'
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
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

      {/* Cover Image URL Workaround */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="cover_image_key" className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
          Cover Image URL <span className="font-normal text-neutral-400">(Milestone 4 URL Workaround)</span>
        </label>
        <input
          id="cover_image_key"
          type="url"
          value={coverImageKey}
          onChange={(e) => setCoverImageKey(e.target.value)}
          placeholder="e.g. https://images.unsplash.com/photo-... or custom image URL"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
        />
        {coverImageKey && (
          <div className="mt-2 relative h-40 w-full rounded-xl border border-border bg-neutral-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageKey} alt="Cover image preview" className="w-full h-full object-cover" />
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

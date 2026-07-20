'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'

interface EventInput {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
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
    departments?: string[];
  };
  onSave: (input: EventInput) => Promise<{ success: boolean; error?: string; id?: string }>;
}


export default function EventForm({ initialData, onSave }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  // Form states
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  
  const [startsAt, setStartsAt] = useState<Date>(() => {
    if (initialData?.starts_at) {
      return new Date(initialData.starts_at)
    }
    const d = new Date()
    d.setMinutes(0)
    d.setSeconds(0)
    d.setMilliseconds(0)
    d.setHours(d.getHours() + 1)
    return d
  })

  const [endsAt, setEndsAt] = useState<Date | null>(() => {
    if (initialData?.ends_at) {
      return new Date(initialData.ends_at)
    }
    return null
  })

  const [location, setLocation] = useState(initialData?.location || '')

  // Handlers for smart duration sync and date/time manipulation
  const handleStartsAtChange = (newStarts: Date) => {
    const duration = endsAt ? endsAt.getTime() - startsAt.getTime() : null
    setStartsAt(newStarts)
    if (endsAt && duration !== null) {
      setEndsAt(new Date(newStarts.getTime() + duration))
    }
  }

  const handleStartsAtDateChange = (date: Date | null) => {
    if (!date) return
    const next = new Date(startsAt)
    next.setFullYear(date.getFullYear())
    next.setMonth(date.getMonth())
    next.setDate(date.getDate())
    handleStartsAtChange(next)
  }

  const handleStartsAtTimeChange = (time: Date | null) => {
    if (!time) return
    const next = new Date(startsAt)
    next.setHours(time.getHours())
    next.setMinutes(time.getMinutes())
    next.setSeconds(0)
    next.setMilliseconds(0)
    handleStartsAtChange(next)
  }

  const handleEndsAtDateChange = (date: Date | null) => {
    if (!date) {
      setEndsAt(null)
      return
    }
    const base = endsAt ? new Date(endsAt) : new Date(startsAt.getTime() + 60 * 60 * 1000)
    base.setFullYear(date.getFullYear())
    base.setMonth(date.getMonth())
    base.setDate(date.getDate())
    setEndsAt(base)
  }

  const handleEndsAtTimeChange = (time: Date | null) => {
    setEndsAt(time)
  }
  const [status, setStatus] = useState<'upcoming' | 'past' | 'cancelled'>(initialData?.status || 'upcoming')
  const [departments, setDepartments] = useState<string[]>(initialData?.departments || [])
  const [coverImageKey, setCoverImageKey] = useState(initialData?.cover_image_key || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')

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
    setUrlInput('')
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

    if (endsAt && endsAt.getTime() <= startsAt.getTime()) {
      setError('End date and time must be after the start date and time.')
      return
    }

    setLoading(true)

    try {
      const startsAtISO = startsAt.toISOString()
      const endsAtISO = endsAt ? endsAt.toISOString() : null

      const result = await onSave({
        title,
        description: description.trim() || null,
        starts_at: startsAtISO,
        ends_at: endsAtISO,
        location: location.trim() || null,
        status,
        cover_image_key: coverImageKey.trim() || null,
        departments,
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
          <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Starts At <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              value={startsAt}
              onChange={handleStartsAtDateChange}
              required
            />
            <TimePicker
              value={startsAt}
              onChange={handleStartsAtTimeChange}
              required
            />
          </div>
        </div>

        {/* Ends At */}
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
            Ends At (Optional)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              value={endsAt}
              onChange={handleEndsAtDateChange}
              placeholder="Add end date"
            />
            <TimePicker
              value={endsAt}
              onChange={handleEndsAtTimeChange}
              relativeTo={startsAt}
              placeholder="Add end time"
            />
          </div>
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

      {/* Organizing Departments */}
      <div className="flex flex-col space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500">
          Organizing Departments
        </span>
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'CASuals', color: 'bg-sky-50 text-sky-700 border-sky-300' },
            { id: 'TOPICS', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
            { id: 'Palette', color: 'bg-pink-50 text-pink-700 border-pink-300' },
          ].map((dept) => {
            const isChecked = departments.includes(dept.id);
            return (
              <label
                key={dept.id}
                className={`relative flex items-center justify-center px-4 py-3 rounded-xl border border-border bg-surface cursor-pointer select-none text-sm font-bold transition-all active:scale-95 duration-200 ${
                  isChecked
                    ? dept.id === 'CASuals'
                      ? 'bg-sky-50 text-sky-700 border-sky-300 ring-1 ring-sky-300 shadow-sm'
                      : dept.id === 'TOPICS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300 shadow-sm'
                        : 'bg-pink-50 text-pink-700 border-pink-300 ring-1 ring-pink-300 shadow-sm'
                    : 'text-text-muted hover:border-neutral-400 hover:text-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    setDepartments((prev) =>
                      prev.includes(dept.id)
                        ? prev.filter((d) => d !== dept.id)
                        : [...prev, dept.id]
                    );
                  }}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    isChecked
                      ? dept.id === 'CASuals'
                        ? 'bg-sky-500'
                        : dept.id === 'TOPICS'
                          ? 'bg-emerald-500'
                          : 'bg-pink-500'
                      : 'bg-neutral-300'
                  }`} />
                  {dept.id}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Cover Image */}
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
          <div className="flex flex-col space-y-3">
            {/* Image Source Selection */}
            <div className="flex rounded-xl bg-neutral-100 p-1 border border-border max-w-xs">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  imageSource === 'upload'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  imageSource === 'url'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Image URL
              </button>
            </div>

            {imageSource === 'upload' ? (
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
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="https://example.com/cover-image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-grow rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setCoverImageKey(urlInput.trim());
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                >
                  Apply
                </button>
              </div>
            )}
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

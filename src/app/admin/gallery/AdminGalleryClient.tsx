'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createArtworkAction, takedownArtworkAction, updateArtworkAction } from '@/server/actions/gallery'

interface ArtworkConsent {
  id: string;
  storage_key: string;
  title: string | null;
  artist_credit: string;
  status: 'visible' | 'removed';
  created_at: string;
  consent?: {
    consent_method: string;
    consented_at: string;
    note: string | null;
  };
}

interface AdminGalleryClientProps {
  initialArtworks: ArtworkConsent[];
}

export default function AdminGalleryClient({ initialArtworks }: AdminGalleryClientProps) {
  const router = useRouter()
  const [artworks, setArtworks] = useState<ArtworkConsent[]>(initialArtworks)

  // Upload Form states
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [artistCredit, setArtistCredit] = useState('')
  const [consentMethod, setConsentMethod] = useState<'telegram_message' | 'in_person' | 'email'>('telegram_message')
  const [consentedAt, setConsentedAt] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // Edit dialog states
  const [mounted, setMounted] = useState(false)
  const [editing, setEditing] = useState<ArtworkConsent | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editArtistCredit, setEditArtistCredit] = useState('')
  const [editConsentMethod, setEditConsentMethod] = useState<'telegram_message' | 'in_person' | 'email'>('telegram_message')
  const [editConsentedAt, setEditConsentedAt] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => setMounted(true), [])

  // Close the edit dialog on Escape
  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !savingEdit) setEditing(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing, savingEdit])

  // Keep an object URL preview alongside the selected file
  useEffect(() => {
    if (!file) {
      setFilePreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const selectFile = (picked: File | null) => {
    if (picked && !picked.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setFile(picked)
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatBytes = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  // Upload artwork handler
  const handleUploadArtwork = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (imageSource === 'upload' && !file) {
      setError('Please select an artwork image file.')
      return
    }
    if (imageSource === 'url' && !imageUrl.trim()) {
      setError('Please enter an artwork image URL.')
      return
    }
    if (!artistCredit.trim()) {
      setError('Artist credit is required.')
      return
    }
    if (!consentMethod) {
      setError('Consent method is required.')
      return
    }
    if (!consentedAt) {
      setError('Consent date is required.')
      return
    }

    setProcessing(true)

    try {
      let storageKey = ''

      if (imageSource === 'upload') {
        // Compress file client-side using canvas WebP conversion
        const { compressImageClient } = await import('@/lib/image-client')
        const compressedFile = await compressImageClient(file!)

        // 1. Upload file to /api/uploads/upload
        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('folder', 'gallery')

        const uploadRes = await fetch('/api/uploads/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload image to storage.')
        }
        storageKey = uploadData.url
      } else {
        storageKey = imageUrl.trim()
      }

      // 2. Call Server Action to save records to database
      const actionResult = await createArtworkAction({
        storage_key: storageKey,
        title: title.trim() || null,
        artist_credit: artistCredit.trim(),
        consent_method: consentMethod,
        consented_at: consentedAt,
        note: note.trim() || undefined,
      })

      if (actionResult.success) {
        setSuccess('Artwork successfully curated and added to the gallery!')
        
        // Optimistically prepend to list
        const newArtwork: ArtworkConsent = {
          id: actionResult.id as string,
          storage_key: storageKey,
          title: title.trim() || null,
          artist_credit: artistCredit.trim(),
          status: 'visible',
          created_at: new Date().toISOString(),
          consent: {
            consent_method: consentMethod,
            consented_at: consentedAt,
            note: note.trim() || null,
          }
        }
        
        setArtworks(prev => [newArtwork, ...prev])
        
        // Reset form
        clearFile()
        setImageUrl('')
        setTitle('')
        setArtistCredit('')
        setConsentMethod('telegram_message')
        setConsentedAt(new Date().toISOString().split('T')[0])
        setNote('')

        router.refresh()
      } else {
        setError(actionResult.error || 'Failed to curate artwork.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setProcessing(false)
    }
  }

  // Open the edit dialog with the artwork's current details prefilled
  const openEdit = (art: ArtworkConsent) => {
    setEditing(art)
    setEditError(null)
    setEditTitle(art.title || '')
    setEditArtistCredit(art.artist_credit)
    setEditConsentMethod(
      (art.consent?.consent_method as 'telegram_message' | 'in_person' | 'email') || 'telegram_message'
    )
    setEditConsentedAt(
      art.consent?.consented_at
        ? new Date(art.consent.consented_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    )
    setEditNote(art.consent?.note || '')
  }

  // Save edited details handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return

    if (!editArtistCredit.trim()) {
      setEditError('Artist credit is required.')
      return
    }
    if (!editConsentedAt) {
      setEditError('Consent date is required.')
      return
    }

    setEditError(null)
    setSavingEdit(true)

    try {
      const result = await updateArtworkAction({
        id: editing.id,
        title: editTitle.trim() || null,
        artist_credit: editArtistCredit.trim(),
        consent_method: editConsentMethod,
        consented_at: editConsentedAt,
        note: editNote.trim() || undefined,
      })

      if (result.success) {
        setArtworks(prev =>
          prev.map(art =>
            art.id === editing.id
              ? {
                  ...art,
                  title: editTitle.trim() || null,
                  artist_credit: editArtistCredit.trim(),
                  consent: {
                    consent_method: editConsentMethod,
                    consented_at: editConsentedAt,
                    note: editNote.trim() || null,
                  },
                }
              : art
          )
        )
        setEditing(null)
        setSuccess('Artwork details updated.')
        router.refresh()
      } else {
        setEditError(result.error || 'Failed to update artwork.')
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Takedown handler
  const handleTakedown = async (artworkId: string) => {
    if (!confirm('Are you sure you want to take down this artwork? The file will be deleted from storage, and its status will be set to removed.')) {
      return
    }

    try {
      const result = await takedownArtworkAction(artworkId)
      if (result.success) {
        // Update local status optimistically
        setArtworks(prev =>
          prev.map(art =>
            art.id === artworkId ? { ...art, status: 'removed' } : art
          )
        )
        router.refresh()
      } else {
        alert(result.error || 'Failed to take down artwork.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* Upload Panel */}
      <div className="lg:col-span-2">
        <div className="border border-border bg-surface p-6 shadow-sm sticky top-20">
          <h2 className="text-lg font-black tracking-tight text-neutral-900 mb-4">
            Curate New Artwork
          </h2>

          {error && (
            <div className="border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleUploadArtwork} className="space-y-4">
            {/* Image Source Selection */}
            <div className="flex bg-neutral-100 p-1 border border-border">
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
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
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-none transition-all ${
                  imageSource === 'url'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Conditionally Render File Input or URL Input */}
            {imageSource === 'upload' ? (
              <div className="flex flex-col space-y-1">
                <label htmlFor="artwork_file" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                  Artwork File <span className="text-red-500">*</span>
                </label>

                <input
                  id="artwork_file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => selectFile(e.target.files?.[0] || null)}
                  disabled={processing}
                  className="sr-only"
                />

                {/* Drop zone / preview */}
                <div
                  onDragOver={(e) => { e.preventDefault(); if (!processing) setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragActive(false)
                    if (processing) return
                    selectFile(e.dataTransfer.files?.[0] || null)
                  }}
                  className={`relative border border-dashed transition-colors ${
                    dragActive ? 'border-accent bg-accent/5' : 'border-border bg-neutral-50'
                  } ${processing ? 'opacity-60' : ''}`}
                >
                  {file && filePreview ? (
                    <div className="p-3 space-y-3">
                      <div className="relative h-56 w-full bg-neutral-100 border border-border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={filePreview} alt="Selected artwork preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-800 truncate" title={file.name}>{file.name}</p>
                          <p className="text-[10px] text-neutral-500">{formatBytes(file.size)}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processing}
                            className="px-3 py-1.5 border border-border bg-surface text-[10px] font-black uppercase tracking-wider text-neutral-700 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={clearFile}
                            disabled={processing}
                            className="px-3 py-1.5 border border-border bg-surface text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processing}
                      className="w-full h-56 flex flex-col items-center justify-center gap-2 px-4 text-center disabled:cursor-not-allowed"
                    >
                      <svg className="w-10 h-10 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-neutral-700">
                        Drop an image here, or <span className="text-accent underline underline-offset-2">browse</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        PNG, JPG, WebP or GIF · resized to 1600px and converted to WebP on upload
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                <label htmlFor="artwork_url" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                  Artwork Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="artwork_url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/my-art.jpg"
                  disabled={processing}
                  className="w-full border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                  required={imageSource === 'url'}
                />
                {imageUrl && /^(https?:\/\/|\/).+/.test(imageUrl) && (
                  <div className="mt-2 relative h-56 w-full border border-border bg-neutral-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Artwork URL Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="artwork_title" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                Artwork Title <span className="font-normal text-neutral-400">(Optional)</span>
              </label>
              <input
                id="artwork_title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Anikun's Flower"
                disabled={processing}
                className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
              />
            </div>

            {/* Artist Credit */}
            <div className="flex flex-col space-y-1">
              <label htmlFor="artist_credit" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                Artist Credit <span className="text-red-500">*</span>
              </label>
              <input
                id="artist_credit"
                type="text"
                value={artistCredit}
                onChange={(e) => setArtistCredit(e.target.value)}
                placeholder="e.g. @artist_hand / John NUSCAS"
                disabled={processing}
                className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                required
              />
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">
                Consent Record
              </h3>
              
              <div className="space-y-3">
                {/* Consent Method */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="consent_method" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                    Consent Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="consent_method"
                    value={consentMethod}
                    onChange={(e) => setConsentMethod(e.target.value as 'telegram_message' | 'in_person' | 'email')}
                    disabled={processing}
                    className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                  >
                    <option value="telegram_message">Telegram Message</option>
                    <option value="in_person">In Person</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                {/* Consent Date */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="consent_date" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                    Consented At <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="consent_date"
                    type="date"
                    value={consentedAt}
                    onChange={(e) => setConsentedAt(e.target.value)}
                    disabled={processing}
                    className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                    required
                  />
                </div>

                {/* Note */}
                <div className="flex flex-col space-y-1">
                  <label htmlFor="consent_note" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                    Note / Details <span className="font-normal text-neutral-400">(Optional)</span>
                  </label>
                  <textarea
                    id="consent_note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Telegram message log ID, email thread ref, or signature context"
                    rows={3}
                    disabled={processing}
                    className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-none bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-4"
            >
              {processing ? 'Processing...' : 'Upload & Curate Artwork'}
            </button>
          </form>
        </div>
      </div>

      {/* Artworks List */}
      <div className="lg:col-span-3">
        <div className="border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-neutral-900 mb-6">
            Curated Gallery Artworks ({artworks.length})
          </h2>

          {artworks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border">
              <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-neutral-500">No artworks curated yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Upload files on the left to start populate the gallery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artworks.map((art) => (
                <div 
                  key={art.id}
                  className={`border bg-neutral-50 overflow-hidden flex flex-col transition-all duration-300 ${
                    art.status === 'removed' ? 'opacity-60 border-neutral-200' : 'border-border shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Artwork Image Preview */}
                  <div className="relative h-48 w-full bg-neutral-100 border-b border-border overflow-hidden">
                    {art.status === 'removed' ? (
                      <div className="absolute inset-0 bg-neutral-200/90 flex flex-col items-center justify-center z-10">
                        <svg className="w-8 h-8 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="text-xs uppercase font-extrabold text-neutral-500">Asset Deleted</span>
                      </div>
                    ) : (
                      <Image fill unoptimized src={art.storage_key} alt={art.title || 'Curated artwork'} className="object-cover" />
                    )}

                    {/* Status Badge */}
                    <span className={`absolute top-3 right-3 text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded-none border ${
                      art.status === 'visible'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}>
                      {art.status}
                    </span>
                  </div>

                  {/* Artwork details */}
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-neutral-800 text-sm leading-snug">
                        {art.title || <span className="text-neutral-400 italic">Untitled</span>}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        By <span className="font-bold text-neutral-700">{art.artist_credit}</span>
                      </p>
                    </div>

                    {/* Consent log box */}
                    {art.consent && (
                      <div className="rounded-none bg-neutral-100 p-2.5 text-[10px] text-neutral-600 border border-neutral-200 space-y-1">
                        <div className="flex justify-between font-bold text-neutral-700 uppercase tracking-wider text-[8px] border-b border-neutral-200 pb-1">
                          <span>Consent Audit</span>
                          <span>{art.consent.consent_method.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span>Consented Date:</span>
                          <span className="font-semibold">{new Date(art.consent.consented_at).toLocaleDateString('en-SG')}</span>
                        </div>
                        {art.consent.note && (
                          <div className="mt-1 pt-1 border-t border-neutral-200/50 break-words">
                            <span className="font-semibold block mb-0.5 uppercase tracking-wider text-[8px]">Note:</span>
                            {art.consent.note}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(art)}
                        className="flex-1 py-2 border border-border bg-surface hover:border-accent hover:text-accent text-neutral-700 rounded-none text-[10px] font-extrabold uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Edit Details
                      </button>
                      {art.status === 'visible' && (
                        <button
                          onClick={() => handleTakedown(art.id)}
                          className="flex-1 py-2 bg-neutral-900 hover:bg-red-700 text-white hover:text-white rounded-none text-[10px] font-extrabold uppercase tracking-wider transition-colors active:scale-95"
                        >
                          Takedown & Delete File
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Details Dialog */}
      {editing && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { if (!savingEdit) setEditing(null) }}
        >
          <div
            className="bg-surface border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Edit Artwork Details</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Corrects the credit and consent record only. The uploaded image itself cannot be swapped &mdash; take it down and re-upload if the wrong file was used.
                </p>
              </div>

              {editError && (
                <div className="border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                  {editError}
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="edit_title" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                  Artwork Title <span className="font-normal text-neutral-400">(Optional)</span>
                </label>
                <input
                  id="edit_title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Anikun's Flower"
                  disabled={savingEdit}
                  className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                />
              </div>

              {/* Artist Credit */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="edit_artist_credit" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                  Artist Credit <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit_artist_credit"
                  type="text"
                  value={editArtistCredit}
                  onChange={(e) => setEditArtistCredit(e.target.value)}
                  placeholder="e.g. @artist_hand / John NUSCAS"
                  disabled={savingEdit}
                  className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                  required
                />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-3">
                  Consent Record
                </h4>

                <div className="space-y-3">
                  {/* Consent Method */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_consent_method" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                      Consent Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_consent_method"
                      value={editConsentMethod}
                      onChange={(e) => setEditConsentMethod(e.target.value as 'telegram_message' | 'in_person' | 'email')}
                      disabled={savingEdit}
                      className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                    >
                      <option value="telegram_message">Telegram Message</option>
                      <option value="in_person">In Person</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  {/* Consent Date */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_consent_date" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                      Consented At <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit_consent_date"
                      type="date"
                      value={editConsentedAt}
                      onChange={(e) => setEditConsentedAt(e.target.value)}
                      disabled={savingEdit}
                      className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                      required
                    />
                  </div>

                  {/* Note */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="edit_consent_note" className="text-[10px] uppercase font-black tracking-wider text-neutral-500">
                      Note / Details <span className="font-normal text-neutral-400">(Optional)</span>
                    </label>
                    <textarea
                      id="edit_consent_note"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="e.g. Telegram message log ID, email thread ref, or signature context"
                      rows={3}
                      disabled={savingEdit}
                      className="w-full rounded-none border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-neutral-850 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-none bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

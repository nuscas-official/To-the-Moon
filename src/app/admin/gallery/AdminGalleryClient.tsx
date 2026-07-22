'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createArtworkAction, takedownArtworkAction } from '@/server/actions/gallery'

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
        setFile(null)
        setImageUrl('')
        setTitle('')
        setArtistCredit('')
        setConsentMethod('telegram_message')
        setConsentedAt(new Date().toISOString().split('T')[0])
        setNote('')
        
        const fileInput = document.getElementById('artwork_file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Upload Panel */}
      <div className="lg:col-span-1">
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
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
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
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={processing}
                  className="w-full border border-border bg-neutral-50 px-3 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none cursor-pointer disabled:cursor-not-allowed"
                  required={imageSource === 'upload'}
                />
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
                  className="w-full border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                  required={imageSource === 'url'}
                />
                {imageUrl && /^(https?:\/\/|\/).+/.test(imageUrl) && (
                  <div className="mt-2 relative h-32 w-full border border-border bg-neutral-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Artwork URL Preview"
                      className="w-full h-full object-cover"
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
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
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
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
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
                    className="w-full rounded-md border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
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
                    className="w-full rounded-md border border-border bg-surface px-4 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
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
                    className="w-full rounded-md border border-border bg-surface px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-4"
            >
              {processing ? 'Processing...' : 'Upload & Curate Artwork'}
            </button>
          </form>
        </div>
      </div>

      {/* Artworks List */}
      <div className="lg:col-span-2">
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
                    <span className={`absolute top-3 right-3 text-[9px] uppercase font-black tracking-wider px-2 py-1 rounded-md border ${
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
                      <div className="rounded-lg bg-neutral-100 p-2.5 text-[10px] text-neutral-600 border border-neutral-200 space-y-1">
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

                    {/* Takedown Button */}
                    {art.status === 'visible' && (
                      <button
                        onClick={() => handleTakedown(art.id)}
                        className="w-full py-2 bg-neutral-900 hover:bg-red-700 text-white hover:text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Takedown & Delete File
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

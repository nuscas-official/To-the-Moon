'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateSeasonalPickAction, updateJoinReasonsAction, updateSiteThemeAction } from '@/server/actions/settings'
import type { SiteTheme } from '@/lib/siteTheme'
import { Reorder } from 'framer-motion'

interface SeasonalPick {
  title: string
  accent_hex: string
  image_url: string
}

interface AdminSettingsClientProps {
  initialSeasonalPick: SeasonalPick | null
  initialJoinReasons: string[] | null
  initialSiteTheme: SiteTheme
}

const DEFAULT_SEASONAL_PICK: SeasonalPick = {
  title: '',
  accent_hex: '#c82333',
  image_url: ''
}

export default function AdminSettingsClient({
  initialSeasonalPick,
  initialJoinReasons,
  initialSiteTheme,
}: AdminSettingsClientProps) {
  // 0. Site Theme State
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(initialSiteTheme)
  const [loadingTheme, setLoadingTheme] = useState(false)

  // 1. Seasonal Pick State
  const [seasonalPick, setSeasonalPick] = useState<SeasonalPick>(
    initialSeasonalPick || DEFAULT_SEASONAL_PICK
  )
  const [loadingSeasonal, setLoadingSeasonal] = useState(false)
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Compressing & uploading...')
    
    try {
      // Compress file client-side using canvas WebP conversion
      const { compressImageClient } = await import('@/lib/image-client')
      const compressedFile = await compressImageClient(file)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('folder', 'settings')

      const res = await fetch('/api/uploads/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setSeasonalPick(prev => ({ ...prev, image_url: data.url }))
      setUploadProgress(null)
      showFeedback('success', 'Image uploaded successfully!')
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to upload banner image')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  // 2. Join Reasons State
  const [joinReasons, setJoinReasons] = useState<string[]>(
    initialJoinReasons || []
  )
  const [newReason, setNewReason] = useState('')
  const [loadingReasons, setLoadingReasons] = useState(false)

  // 3. Feedback State (toast notifications)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  // Save Seasonal Pick changes
  const handleSaveSeasonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingSeasonal(true)
    try {
      const res = await updateSeasonalPickAction(seasonalPick)
      if (res.success) {
        showFeedback('success', 'Seasonal pick details updated successfully!')
      } else {
        showFeedback('error', res.error || 'Failed to update seasonal pick.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setLoadingSeasonal(false)
    }
  }

  // Switch the site-wide seasonal theme
  const handleToggleHalloween = async () => {
    const next: SiteTheme = siteTheme === 'halloween' ? 'default' : 'halloween'
    setLoadingTheme(true)
    try {
      const res = await updateSiteThemeAction(next)
      if (res.success) {
        setSiteTheme(next)
        showFeedback('success', next === 'halloween' ? 'Halloween theme is live.' : 'Back to the regular theme.')
      } else {
        showFeedback('error', res.error || 'Failed to update site theme.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setLoadingTheme(false)
    }
  }

  // Save Join Reasons changes
  const handleSaveReasons = async () => {
    if (joinReasons.length === 0) {
      showFeedback('error', 'Please add at least one join reason before saving.')
      return
    }
    setLoadingReasons(true)
    try {
      const res = await updateJoinReasonsAction(joinReasons)
      if (res.success) {
        showFeedback('success', 'Join reasons saved successfully!')
      } else {
        showFeedback('error', res.error || 'Failed to save join reasons.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setLoadingReasons(false)
    }
  }

  // Add reason to local list
  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newReason.trim()
    if (!trimmed) return
    if (joinReasons.includes(trimmed)) {
      showFeedback('error', 'This reason already exists in the list.')
      return
    }
    setJoinReasons([...joinReasons, trimmed])
    setNewReason('')
  }

  // Delete reason from local list
  const handleDeleteReason = (index: number) => {
    setJoinReasons(joinReasons.filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 shadow-lg border text-sm font-bold animate-fade-in flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>
            {feedback.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Seasonal site theme toggle */}
      <div className="border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Halloween Theme
          </h2>
          <p className="text-xs text-text-muted">
            Temporarily re-skins the whole public site with a pumpkin &amp; midnight palette and a few bats. Switch it off after the season.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={siteTheme === 'halloween'}
          disabled={loadingTheme}
          onClick={handleToggleHalloween}
          className={`px-5 py-2.5 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-none shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0 border ${
            siteTheme === 'halloween'
              ? 'bg-accent hover:bg-accent-hover border-accent'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
          }`}
        >
          {loadingTheme && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{siteTheme === 'halloween' ? 'On — Turn Off' : 'Off — Turn On'}</span>
        </button>
      </div>

      {/* Grid containing two editors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Editor 1: Seasonal Pick (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Seasonal Highlight Pick
          </h2>
          
          <form onSubmit={handleSaveSeasonal} className="border border-border bg-surface p-6 shadow-sm space-y-6">
            <p className="text-xs text-text-muted">
              Configure the anime highlight displayed in the giant hero card on the landing page.
            </p>

            {/* Anime Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-500">Anime Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sousou no Frieren"
                value={seasonalPick.title}
                onChange={(e) => setSeasonalPick({ ...seasonalPick, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
              />
            </div>

            {/* Accent Hex Color */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-500">Accent Hex Color</label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    required
                    placeholder="e.g. #c82333"
                    value={seasonalPick.accent_hex}
                    onChange={(e) => setSeasonalPick({ ...seasonalPick, accent_hex: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
                  />
                  {/* Hex verification preview dot inside input */}
                  {/^#[0-9A-Fa-f]{3,6}$/.test(seasonalPick.accent_hex) && (
                    <span 
                      style={{ backgroundColor: seasonalPick.accent_hex }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-none border border-neutral-200/50 shadow-sm"
                    />
                  )}
                </div>
                {/* HTML Color Picker block */}
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(seasonalPick.accent_hex) ? seasonalPick.accent_hex : '#c82333'}
                  onChange={(e) => setSeasonalPick({ ...seasonalPick, accent_hex: e.target.value })}
                  className="w-11 h-10 border border-neutral-200 rounded-none cursor-pointer bg-neutral-50 p-1 flex-shrink-0"
                />
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-500 block">Banner Image</label>
              
              {/* Image Source Selection */}
              <div className="flex rounded-none bg-neutral-100 p-1 border border-border max-w-xs">
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-none transition-all ${
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

              {imageSource === 'upload' ? (
                <div className="flex flex-col space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="w-full rounded-none border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none cursor-pointer disabled:cursor-not-allowed font-bold"
                  />
                  {uploading && (
                    <p className="text-xs text-accent font-bold animate-pulse mt-1">
                      {uploadProgress || 'Uploading image...'}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. https://images.unsplash.com/... or any HTTPS url"
                  value={seasonalPick.image_url}
                  onChange={(e) => setSeasonalPick({ ...seasonalPick, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
                />
              )}

              {/* Image Live Preview */}
              {seasonalPick.image_url && /^(https?:\/\/|\/).+/.test(seasonalPick.image_url) && (
                <div className="mt-3 border border-neutral-200 overflow-hidden bg-neutral-100 aspect-video relative">
                  <Image
                    src={seasonalPick.image_url}
                    alt="Live preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none">
                    Preview
                  </div>
                  <button
                    type="button"
                    onClick={() => setSeasonalPick({ ...seasonalPick, image_url: '' })}
                    className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-none bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors"
                    title="Remove Image"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingSeasonal}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-none shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border border-neutral-800"
              >
                {loadingSeasonal && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Highlight Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Editor 2: Join reasons (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Join Reasons Manager
          </h2>

          <div className="border border-border bg-surface p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-text-muted">
                Manage the dynamic quotes and reasons displayed to guest users on the homepage.
              </p>
              <button
                type="button"
                disabled={loadingReasons}
                onClick={handleSaveReasons}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-none shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-accent flex-shrink-0"
              >
                {loadingReasons && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save List Order</span>
              </button>
            </div>

            {/* Add reason inline form */}
            <form onSubmit={handleAddReason} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a new join reason..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-grow px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-none text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 border border-neutral-800"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </button>
            </form>

            {/* Reasons list */}
            <div className="max-h-[350px] overflow-y-auto pr-1">
              {joinReasons.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-muted border border-dashed border-border rounded-none">
                  No reasons defined yet. Add one above!
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={joinReasons}
                  onReorder={setJoinReasons}
                  className="space-y-2"
                >
                  {joinReasons.map((reason, idx) => (
                    <Reorder.Item
                      key={reason}
                      value={reason}
                      className="p-3.5 flex items-center justify-between gap-4 bg-neutral-50 border border-neutral-200/60 rounded-none hover:bg-neutral-100/40 transition-colors group/item cursor-grab active:cursor-grabbing flex-shrink-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Drag Handle Icon */}
                        <div className="text-neutral-400 group-hover/item:text-neutral-600 transition-colors flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>

                        <p className="text-xs font-semibold text-neutral-800 truncate" title={reason}>
                          {reason}
                        </p>
                      </div>

                      <div className="flex gap-1 items-center flex-shrink-0">
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteReason(idx)}
                          className="px-2 py-1 rounded-none bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

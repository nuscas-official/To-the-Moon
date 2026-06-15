'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateSeasonalPickAction, updateJoinReasonsAction } from '@/server/actions/settings'

interface SeasonalPick {
  title: string
  accent_hex: string
  image_url: string
}

interface AdminSettingsClientProps {
  initialSeasonalPick: SeasonalPick | null
  initialJoinReasons: string[] | null
}

const DEFAULT_SEASONAL_PICK: SeasonalPick = {
  title: '',
  accent_hex: '#a855f7',
  image_url: ''
}

export default function AdminSettingsClient({
  initialSeasonalPick,
  initialJoinReasons,
}: AdminSettingsClientProps) {
  // 1. Seasonal Pick State
  const [seasonalPick, setSeasonalPick] = useState<SeasonalPick>(
    initialSeasonalPick || DEFAULT_SEASONAL_PICK
  )
  const [loadingSeasonal, setLoadingSeasonal] = useState(false)

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
        showFeedback('success', 'Absurd join reasons saved successfully!')
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
    if (!newReason.trim()) return
    setJoinReasons([...joinReasons, newReason.trim()])
    setNewReason('')
  }

  // Delete reason from local list
  const handleDeleteReason = (index: number) => {
    setJoinReasons(joinReasons.filter((_, idx) => idx !== index))
  }

  // Move reason up in order
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...joinReasons]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setJoinReasons(updated)
  }

  // Move reason down in order
  const handleMoveDown = (index: number) => {
    if (index === joinReasons.length - 1) return
    const updated = [...joinReasons]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setJoinReasons(updated)
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-bold animate-fade-in flex items-center gap-2 ${
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

      {/* Grid containing two editors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Editor 1: Seasonal Pick (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Seasonal Highlight Pick
          </h2>
          
          <form onSubmit={handleSaveSeasonal} className="border border-border bg-surface rounded-2xl p-6 shadow-sm space-y-6">
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
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
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
                    placeholder="e.g. #a855f7"
                    value={seasonalPick.accent_hex}
                    onChange={(e) => setSeasonalPick({ ...seasonalPick, accent_hex: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
                  />
                  {/* Hex verification preview dot inside input */}
                  {/^#[0-9A-Fa-f]{3,6}$/.test(seasonalPick.accent_hex) && (
                    <span 
                      style={{ backgroundColor: seasonalPick.accent_hex }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-neutral-200/50 shadow-sm"
                    />
                  )}
                </div>
                {/* HTML Color Picker block */}
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(seasonalPick.accent_hex) ? seasonalPick.accent_hex : '#a855f7'}
                  onChange={(e) => setSeasonalPick({ ...seasonalPick, accent_hex: e.target.value })}
                  className="w-11 h-10 border border-neutral-200 rounded-xl cursor-pointer bg-neutral-50 p-1 flex-shrink-0"
                />
              </div>
            </div>

            {/* Banner Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-neutral-500">Banner Image URL</label>
              <input
                type="text"
                required
                placeholder="e.g. https://images.unsplash.com/..."
                value={seasonalPick.image_url}
                onChange={(e) => setSeasonalPick({ ...seasonalPick, image_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
              />
              {/* Image Live Preview */}
              {seasonalPick.image_url && /^https?:\/\/.+/.test(seasonalPick.image_url) && (
                <div className="mt-3 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 aspect-video relative">
                  <Image
                    src={seasonalPick.image_url}
                    alt="Live preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-neutral-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Preview
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingSeasonal}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border border-neutral-800"
              >
                {loadingSeasonal && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Highlight Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Editor 2: Absurd reasons (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Absurd Reasons Manager
          </h2>

          <div className="border border-border bg-surface rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-text-muted">
                Manage the random absurd quotes and reasons displayed to guest users on the homepage.
              </p>
              <button
                type="button"
                disabled={loadingReasons}
                onClick={handleSaveReasons}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-accent flex-shrink-0"
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
                placeholder="Enter a new absurd reason..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-grow px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-accent text-sm font-bold text-neutral-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1 border border-neutral-800"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </button>
            </form>

            {/* Reasons list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {joinReasons.length === 0 ? (
                <div className="text-center py-10 text-xs text-text-muted border border-dashed border-border rounded-xl">
                  No reasons defined yet. Add one above!
                </div>
              ) : (
                joinReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between gap-4 bg-neutral-50 border border-neutral-200/60 rounded-xl hover:bg-neutral-100/40 transition-colors group/item"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-500 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-neutral-800 truncate" title={reason}>
                        {reason}
                      </p>
                    </div>

                    <div className="flex gap-1 items-center flex-shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Move Up"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={idx === joinReasons.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Move Down"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteReason(idx)}
                        className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { searchAniList, type AniListResult } from '@/lib/anilist'
import { submitRatingAction, deleteRatingAction } from '@/server/actions/ratings'

interface UserRating {
  id: string;
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  score: number;
  note: string | null;
  updated_at: string;
}

interface MemberRatingsDashboardProps {
  initialRatings: UserRating[];
}

interface ActiveRatingState {
  id?: string; // present only if editing an existing DB record
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  score: number;
  note: string;
}

export default function MemberRatingsDashboard({ initialRatings }: MemberRatingsDashboardProps) {
  const router = useRouter()
  const [ratings, setRatings] = useState<UserRating[]>(initialRatings)

  // Sync state with server-updated props
  useEffect(() => {
    setRatings(initialRatings)
  }, [initialRatings])

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AniListResult[]>([])
  const [searching, setSearching] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeRating, setActiveRating] = useState<ActiveRatingState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounced search logic (400ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchAniList(searchQuery)
        setSearchResults(results)
      } catch (err) {
        console.error('Failed to search AniList:', err)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Open modal for a search result card
  const handleOpenForSearchResult = (media: AniListResult) => {
    setSubmitError(null)
    
    // Check if user has already rated this title
    const existing = ratings.find(r => r.anilist_id === media.id)
    
    setActiveRating({
      id: existing?.id,
      anilist_id: media.id,
      media_type: media.type === 'MANGA' ? 'manga' : 'anime',
      title_en: media.title.english || media.title.romaji || 'Untitled',
      cover_image_url: media.coverImage.medium,
      score: existing?.score || 5, // Default to 5 if new rating
      note: existing?.note || '',
    })
    setIsModalOpen(true)
  }

  // Open modal for editing an existing rating
  const handleOpenForEdit = (rating: UserRating) => {
    setSubmitError(null)
    setActiveRating({
      id: rating.id,
      anilist_id: rating.anilist_id,
      media_type: rating.media_type,
      title_en: rating.title_en,
      cover_image_url: rating.cover_image_url,
      score: rating.score,
      note: rating.note || '',
    })
    setIsModalOpen(true)
  }

  // Handle rating submission
  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRating) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const result = await submitRatingAction({
        anilist_id: activeRating.anilist_id,
        media_type: activeRating.media_type,
        title_en: activeRating.title_en,
        cover_image_url: activeRating.cover_image_url,
        score: activeRating.score,
        note: activeRating.note.trim() || null,
      })

      if (result.success) {
        setIsModalOpen(false)
        setActiveRating(null)
        setSearchQuery('')
        router.refresh()
      } else {
        setSubmitError(result.error || 'Failed to submit rating.')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle rating delete
  const handleDeleteRating = async (ratingId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete your rating for "${title}"?`)) {
      return
    }

    try {
      const result = await deleteRatingAction(ratingId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete rating.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  return (
    <div className="w-full space-y-10">
      
      {/* 1. AniList Search Panel */}
      <div className="border border-border bg-surface p-6 shadow-sm">
        <div className="max-w-xl space-y-4">
          <div>
            <h2 className="text-sm uppercase tracking-wider font-extrabold text-neutral-500">
              Add New Rating
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Type the title of the anime or manga to search AniList and add it to your ratings.
            </p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title (e.g. Frieren, One Piece)..."
              className="w-full border border-border bg-surface pl-10 pr-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
            />
            <div className="absolute left-3.5 top-3.5">
              {searching ? (
                <svg className="animate-spin h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border/60">
            {searchResults.map((item) => {
              const hasRated = ratings.some(r => r.anilist_id === item.id)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenForSearchResult(item)}
                  className="flex flex-col items-center p-3 border border-border hover:border-accent bg-surface hover:bg-neutral-50/50 shadow-sm transition-all text-center group cursor-pointer"
                >
                  <div className="relative h-28 w-20 overflow-hidden border border-border bg-neutral-100 mb-3 shrink-0">
                    {item.coverImage.medium ? (
                      <Image fill unoptimized src={item.coverImage.medium} alt={item.title.english || item.title.romaji || 'Cover image'} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none border mb-1.5 ${
                    item.type === 'MANGA'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {item.type}
                  </span>

                  <div className="text-xs font-extrabold text-neutral-800 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {item.title.english || item.title.romaji || 'Untitled'}
                  </div>

                  {hasRated && (
                    <span className="mt-2 text-[9px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-none border border-accent/20">
                      Already Rated
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. My Logged Ratings Table */}
      <div>
        <div className="border-b border-border pb-3 mb-4">
          <h2 className="text-sm uppercase tracking-wider font-extrabold text-neutral-500">
            My Submitted Ratings
          </h2>
          <p className="text-[10px] text-text-muted mt-1">
            A comprehensive list of all scores and notes you have submitted.
          </p>
        </div>

        {ratings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-300 bg-neutral-50/50 p-6">
            <p className="text-xs text-text-muted">You haven&apos;t rated any titles yet. Search above to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-neutral-500">
              <thead className="bg-neutral-50 text-[10px] uppercase font-black tracking-wider text-neutral-400 border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4">Title</th>
                  <th scope="col" className="px-6 py-4">Media</th>
                  <th scope="col" className="px-6 py-4">Score</th>
                  <th scope="col" className="px-6 py-4">Private Note</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border border-t border-border">
                {ratings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-neutral-50/50 transition-colors">
                    
                    {/* Cover & Title */}
                    <td className="px-6 py-4 font-normal text-neutral-900">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-7 flex-shrink-0 overflow-hidden bg-neutral-100">
                          {rating.cover_image_url ? (
                            <Image fill unoptimized src={rating.cover_image_url} alt={rating.title_en} className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="font-extrabold text-neutral-800 line-clamp-1 max-w-[250px]">{rating.title_en}</div>
                      </div>
                    </td>

                    {/* Media Type */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border ${
                        rating.media_type === 'anime'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {rating.media_type}
                      </span>
                    </td>

                    {/* Rating Score */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-accent text-sm">{rating.score}</span>
                        <span className="text-[10px] text-text-muted">/10</span>
                      </div>
                    </td>

                    {/* Private Note */}
                    <td className="px-6 py-4 text-xs font-semibold text-neutral-600 max-w-[200px] truncate">
                      {rating.note || <span className="text-neutral-300 italic">None</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <a
                          href={`https://anilist.co/${rating.media_type === 'manga' ? 'manga' : 'anime'}/${rating.anilist_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs uppercase font-extrabold tracking-wider text-neutral-600 hover:text-accent transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Open on AniList"
                        >
                          AniList ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenForEdit(rating)}
                          className="text-xs uppercase font-extrabold tracking-wider text-neutral-600 hover:text-accent transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRating(rating.id, rating.title_en)}
                          className="text-xs uppercase font-extrabold tracking-wider text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Rating Dialog Modal */}
      {isModalOpen && activeRating && mounted && createPortal(
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border max-w-md w-full p-6 shadow-xl animate-fade-in text-left flex flex-col gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-lg text-neutral-900 truncate pr-6">
                {activeRating.id ? 'Edit Rating' : 'Rate Title'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                {submitError}
              </div>
            )}

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveRating} className="space-y-5">
              {/* Media Card Details */}
              <div className="flex gap-3 items-center bg-neutral-50 p-3 border border-border/80">
                <div className="relative h-14 w-10 overflow-hidden bg-neutral-100 shrink-0">
                  {activeRating.cover_image_url ? (
                    <Image fill unoptimized src={activeRating.cover_image_url} alt={activeRating.title_en} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-[9px] uppercase tracking-wider font-extrabold text-accent">
                      {activeRating.media_type}
                    </div>
                    <a
                      href={`https://anilist.co/${activeRating.media_type === 'manga' ? 'manga' : 'anime'}/${activeRating.anilist_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-accent hover:underline font-extrabold inline-flex items-center gap-0.5"
                      title="Open on AniList"
                    >
                      AniList ↗
                    </a>
                  </div>
                  <h4 className="font-extrabold text-neutral-800 text-xs truncate leading-snug">
                    {activeRating.title_en}
                  </h4>
                </div>
              </div>

              {/* 1-10 Score Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400">
                  Your Score <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = activeRating.score === num
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setActiveRating({ ...activeRating, score: num })}
                        className={`py-2 rounded-none font-black text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-accent text-white shadow shadow-accent/20 scale-105'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Private Note Area */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="modal_note" className="text-[10px] uppercase font-black tracking-wider text-neutral-400">
                  Private Note <span className="font-normal text-neutral-300">(Optional & Hidden)</span>
                </label>
                <textarea
                  id="modal_note"
                  value={activeRating.note}
                  onChange={(e) => setActiveRating({ ...activeRating, note: e.target.value })}
                  placeholder="Record your thoughts, thoughts on characters, review highlights..."
                  rows={3}
                  className="w-full rounded-none border border-border bg-surface px-3 py-2 text-xs text-neutral-800 focus:border-accent focus:ring-1 focus:ring-inset focus:ring-accent focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-border pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-none px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover rounded-none text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : activeRating.id ? 'Save Changes' : 'Submit Rating'}
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

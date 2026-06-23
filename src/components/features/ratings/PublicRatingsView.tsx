'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { RatingAggregate } from '@/types/ratings'

interface PublicRatingsViewProps {
  initialAggregates: RatingAggregate[];
}

type SortOption = 'score_desc' | 'count_desc' | 'title_asc'

export default function PublicRatingsView({ initialAggregates }: PublicRatingsViewProps) {
  const [search, setSearch] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('score_desc')

  // Filter and sort aggregates locally
  const processedAggregates = useMemo(() => {
    let result = [...initialAggregates]

    // 1. Search filter
    if (search.trim()) {
      const query = search.toLowerCase().trim()
      result = result.filter(item => item.title_en.toLowerCase().includes(query))
    }

    // 2. Media type filter
    if (mediaTypeFilter !== 'all') {
      result = result.filter(item => item.media_type === mediaTypeFilter)
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'score_desc') {
        // First sort by score descending, then by count descending, then alphabetical
        if (b.average_score !== a.average_score) {
          return b.average_score - a.average_score
        }
        return b.rating_count - a.rating_count
      }
      if (sortBy === 'count_desc') {
        if (b.rating_count !== a.rating_count) {
          return b.rating_count - a.rating_count
        }
        return b.average_score - a.average_score
      }
      if (sortBy === 'title_asc') {
        return a.title_en.localeCompare(b.title_en)
      }
      return 0
    })

    return result
  }, [initialAggregates, search, mediaTypeFilter, sortBy])

  return (
    <div className="w-full space-y-6">
      
      {/* Informative Note Banner */}
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 flex gap-3 items-start text-left">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-accent">Anonymity & Aggregate Rules</h4>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Scores are hidden until at least 3 members have rated a title. Individual ratings are never exposed to the public.
          </p>
        </div>
      </div>

      {/* Controls: Search, Filters, Sorting */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-border pb-6">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rated titles..."
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters and Sorting dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Media Filter Buttons */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 border border-border">
            {['all', 'anime', 'manga'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMediaTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                  mediaTypeFilter === type 
                    ? 'bg-neutral-900 text-white shadow-sm' 
                    : 'text-text-muted hover:text-neutral-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort Selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-neutral-700 outline-none focus:border-accent cursor-pointer"
          >
            <option value="score_desc">Highest Score</option>
            <option value="count_desc">Most Rated</option>
            <option value="title_asc">Title A–Z</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      {processedAggregates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50 p-8">
          <div className="w-12 h-12 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-neutral-700">No Rated Titles Found</h3>
          <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">
            No items match your active filters, or there are no titles with 3 or more ratings in the system yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedAggregates.map((item) => (
            <div
              key={item.anilist_id}
              className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 chaos-card-active text-left"
            >
              {/* Cover Image */}
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-neutral-100 shadow-inner">
                {item.cover_image_url ? (
                  <Image
                    src={item.cover_image_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-muted to-accent/15 text-accent/30">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Title & Aggregates */}
              <div className="flex-grow min-w-0 flex flex-col justify-between h-full py-1">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider border ${
                      item.media_type === 'anime'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {item.media_type}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold">
                      ID: {item.anilist_id}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-black text-neutral-800 line-clamp-2 leading-tight group-hover:text-accent transition-colors" title={item.title_en}>
                    {item.title_en}
                  </h3>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <div className="flex items-center gap-1 text-accent font-black text-lg">
                    <span>{item.average_score}</span>
                    <span className="text-xs text-text-muted font-normal">/ 10</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-semibold">
                    &bull; {item.rating_count} {item.rating_count === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

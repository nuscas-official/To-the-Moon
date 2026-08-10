'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The justified ("Flickr") row layout shared by the gallery page and the fullscreen kiosk view.
 * Rows are grouped in JS; the actual sizes are derived in CSS from each row's real width, so a
 * stale or approximate containerWidth only makes a row slightly taller or shorter -- it can never
 * distort a piece.
 */

export interface Artwork {
  id: string
  storage_key: string
  title: string | null
  artist_credit: string
}

export const GAP = 16

/** Give up waiting on a stubborn image so one bad URL can't hold the whole gallery on the skeleton. */
const MEASURE_TIMEOUT_MS = 3000

export interface MeasuredArtwork {
  artwork: Artwork
  ratio: number
}

export interface Row {
  items: MeasuredArtwork[]
  /** Sum of the row's aspect ratios; the row's own width:height ratio once gaps are removed. */
  ratioSum: number
  gapTotal: number
  /** A trailing row that never filled up, so it must not be stretched to full width. */
  partial: boolean
}

/**
 * Greedy justified grouping: keep adding artworks to a row until scaling it to the container width
 * would bring its height down to the target, then commit it.
 */
export function buildRows(items: MeasuredArtwork[], containerWidth: number, target: number): Row[] {
  const rows: Row[] = []
  let current: MeasuredArtwork[] = []
  let ratioSum = 0

  const commit = (partial: boolean) => {
    rows.push({ items: current, ratioSum, gapTotal: GAP * (current.length - 1), partial })
    current = []
    ratioSum = 0
  }

  for (const item of items) {
    current.push(item)
    ratioSum += item.ratio
    const available = containerWidth - GAP * (current.length - 1)
    if (available / ratioSum <= target) commit(false)
  }

  if (current.length) commit(true)

  return rows
}

/** The height a row will actually render at, in px. Mirrors {@link rowHeightStyle}. */
export function rowHeight(row: Row, containerWidth: number, target: number) {
  const exact = (containerWidth - row.gapTotal) / row.ratioSum
  return row.partial ? Math.min(exact, target) : exact
}

/**
 * Row height as pure CSS: (row width - gaps) / sum of aspect ratios, where 100cqw is the gallery's
 * own width. Each tile then takes its natural aspect-ratio at that height, so a full row fills the
 * width exactly at any size -- no flex shrinking, no rounding gaps, and no dependence on JS having
 * an up-to-date width. A partial row is capped at the target height instead of being blown up.
 */
export function rowHeightStyle(row: Row, target: number) {
  const exact = `calc((100cqw - ${row.gapTotal}px) / ${row.ratioSum.toFixed(4)})`
  return row.partial ? `min(${exact}, ${target}px)` : exact
}

/** Resolves each artwork's aspect ratio by loading it; falls back to square on error or timeout. */
export function useAspectRatios(artworks: Artwork[]) {
  const key = artworks.map((a) => a.id).join(',')
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let cancelled = false
    setRatios({})
    setTimedOut(false)

    artworks.forEach((artwork) => {
      const probe = new window.Image()
      const resolve = (ratio: number) => {
        if (!cancelled) setRatios((prev) => ({ ...prev, [artwork.id]: ratio }))
      }
      probe.onload = () => resolve(probe.naturalHeight ? probe.naturalWidth / probe.naturalHeight : 1)
      probe.onerror = () => resolve(1)
      probe.src = artwork.storage_key
    })

    const timer = setTimeout(() => {
      if (!cancelled) setTimedOut(true)
    }, MEASURE_TIMEOUT_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const ready = timedOut || artworks.every((a) => ratios[a.id] !== undefined)
  return { ratios, ready }
}

/** Tracks the container's width so rows re-justify on resize. */
export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

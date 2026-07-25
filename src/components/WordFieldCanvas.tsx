'use client'

import { useEffect, useRef, useCallback } from 'react'

// Placeholder words repeated across the background (swap these out later)
const DEFAULT_WORDS = ['Ineffa', "Miyazaki", 'TOPICS', 'NUSCAS', 'アニメ', 'Kaiki', "Surtr", "Sandrone", "Ougi", "Maomao", "Takopi", 
  "OMGKawaiiAngel", "Freiren", "Oguri Cap", "Ushio", "Eva", "Reze", "April", "Euphonium", "Hyouka", "DIU", "X", "LOTM", "Baccano!",
  "Steins", "Cowboy", "Madoka", "Kaiji", "Haikyuu!", "Your Life on the line", "86", "Bocchi", "Zoro", "99", "Chiikawa", "Old Stories",
  "Minami", "Idol", "Departure", "Orb", "Ainz", "Namae", "Umi da", "Bungee Gum", "Zetsu", "Hyakkimaru", "Shirogane",
  "Kage", "Sorcerer", "Breathing", "My soul", "Chtholly", "Ryukishi07", "Taiga", "Shiki", "Index", "Gremory", "Unravel",
  "MyGO", "Persona", "Uzumaki", "Kurumi", "Sasuke", "Wings", "Yotsugi", "Kurapika", "Satoshi Kon", "Johan", "Light", "Bungou", "Ninen-buri desu ka", 
  "Believe it!", "Mewtwo", "Devilman", "Emilia", "Alya", "Anna", "5cm/s", "Gasai", "Inori", "Yato", "Nao Tomori", "Gilgamesh", "Shield", "Weathering",
  "Lain", "Conan", "Menma", "Ordinal Scale", "Nino"
]

interface WordFieldCanvasProps {
  words?: string[]
  fontSize?: number
  rowGap?: number
  wordGap?: number
  // Below `breakpoint` (px wide), fall back to these so mobile draws fewer,
  // larger words — cheaper to paint and legible on a small screen. Each
  // defaults to a scaled-up version of its desktop counterpart when omitted.
  mobileFontSize?: number
  mobileRowGap?: number
  mobileWordGap?: number
  breakpoint?: number
  opacity?: number
  skipChance?: number
  // Text color; defaults to the section's --color-accent when omitted
  color?: string
  className?: string
}

// Small deterministic PRNG so the scatter layout is stable across redraws
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Renders rows of repeated words as a faint background texture, similar in
 * spirit to a repeated-glyph wallpaper. Rows are staggered and cells are
 * randomly skipped/jittered so the pattern feels hand-placed rather than
 * perfectly gridded. Uses the section's --color-accent for the text.
 *
 * `wordGap` is the constant horizontal gap left *after* each word; the step
 * between words is that gap plus the word's own measured width, so long and
 * short words are spaced consistently regardless of length.
 *
 * Drawing to canvas (rather than a pre-baked image) keeps the text crisp at
 * any device-pixel ratio — the point of preferring this over a webp. Below
 * `breakpoint` the mobile config kicks in: fewer, larger words so a phone
 * paints less while staying legible.
 */
export default function WordFieldCanvas({
  words = DEFAULT_WORDS,
  fontSize = 8,
  rowGap = 64,
  wordGap = 70,
  mobileFontSize,
  mobileRowGap,
  mobileWordGap,
  breakpoint = 640,
  opacity = 0.15,
  skipChance = 0.18,
  color,
  className = '',
}: WordFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Scale for device pixel ratio so text stays crisp
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // On narrow viewports, draw fewer and larger words. Missing mobile values
    // scale off the desktop ones (1.9x type, wider gaps) so callers only need
    // to override when they want something other than that default.
    const isMobile = width < breakpoint
    const size = isMobile ? mobileFontSize ?? fontSize * 1.9 : fontSize
    const rGap = isMobile ? mobileRowGap ?? rowGap * 1.6 : rowGap
    const wGap = isMobile ? mobileWordGap ?? wordGap * 1.6 : wordGap

    const style = getComputedStyle(canvas)
    const accent = style.getPropertyValue('--color-accent').trim() || '#ed475b'
    const fontFamily = style.getPropertyValue('--font-serif').trim() || 'serif'

    ctx.font = `700 ${size}px ${fontFamily}`
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color ?? accent
    ctx.globalAlpha = opacity

    const rand = mulberry32(1113)
    for (let y = rGap * 0.75; y < height; y += rGap) {
      // Stagger each row's start so columns never align between rows
      let x = -wGap - rand() * wGap * 2
      while (x < width + wGap) {
        // Consume all randomness in a fixed order to keep the layout deterministic
        const word = words[Math.floor(rand() * words.length)]
        const skip = rand() < skipChance
        const jx = (rand() - 0.5) * wGap * 0.4
        const jy = (rand() - 0.5) * rGap * 0.2

        // Measure this word so spacing adapts to its length — long words get
        // the same trailing gap as short ones instead of crowding neighbors
        const w = ctx.measureText(word).width
        if (!skip) ctx.fillText(word, x + jx, y + jy)
        x += w + wGap
      }
    }
  }, [words, fontSize, rowGap, wordGap, mobileFontSize, mobileRowGap, mobileWordGap, breakpoint, opacity, skipChance, color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Coalesce burst resize callbacks into a single redraw next frame so
    // dragging the window (or mobile URL-bar show/hide) doesn't thrash paints.
    let raf = 0
    const scheduleDraw = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(scheduleDraw)
    ro.observe(canvas)
    draw()

    // measureText uses the fallback font until the serif finishes loading;
    // redraw once it's ready so spacing reflects the real glyph widths.
    document.fonts?.ready.then(draw).catch(() => {})

    // Redraw when the theme changes so the accent color stays in sync
    const themeObserver = new MutationObserver(scheduleDraw)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      themeObserver.disconnect()
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}

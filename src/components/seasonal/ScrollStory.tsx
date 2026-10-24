'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import type { HalloweenInfographic, InfographicImage } from '@/lib/halloweenInfographics'

const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/nuscomicsoc/'
const SIGN_UP_URL = 'https://forms.gle/aQKoRczbDwUUXwnAA'

/**
 * Scroll story for the /halloween page. Each chapter's text rises in as it
 * scrolls into view and fades as it leaves; on large screens the matching
 * infographic stays pinned beside it and crossfades when the chapter changes.
 * On small screens each infographic sits inline under its text instead.
 */
export default function ScrollStory({ items }: { items: HalloweenInfographic[] }) {
  const [active, setActive] = useState(0)

  return (
    <div className="relative">
      <Hero />

      <section aria-label="Halloween infographics" className="relative lg:grid lg:grid-cols-2 lg:gap-16">
        <div>
          {items.map((item, i) => (
            <Chapter key={item.id} item={item} index={i} total={items.length} onActive={setActive} />
          ))}
        </div>

        {/* Pinned infographics (large screens) */}
        <div className="hidden lg:block">
          <div className="sticky top-[12vh] h-[76vh]">
            <PinnedImage items={items} active={active} />
          </div>
        </div>
      </section>

      <Outro />
    </div>
  )
}

/* ------------------------------------------------------------------ */

const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const wordRise: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const fadeUp: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

/** Splits text into words that each rise out of their own clipped line. */
function RisingWords({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span variants={wordContainer} className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.15em] align-bottom">
          <motion.span variants={wordRise} className="inline-block">
            {word}
            {' '}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

function Hero() {
  const reduce = useReducedMotion()

  return (
    <motion.header
      initial={reduce ? 'visible' : 'hidden'}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col items-center pb-10 pt-6 text-center lg:pt-10"
    >
      <HeroBackdrop />
      {/* Balances the scroll cue below (mt-6 + h-10), so the text centres on the screen.
          Desktop only — on phones the text usually fills the screen, so it would just add top gap. */}
      <div aria-hidden="true" className="hidden h-16 shrink-0 lg:block" />
      {/* Pinned to the top on phones; centred in the spare height on desktop. */}
      <div className="mb-auto flex flex-col items-center lg:my-auto">
      <motion.p variants={fadeUp} className="relative text-xs font-bold uppercase tracking-[0.4em] text-text-muted">
        NUSCAS Halloween 2026
      </motion.p>
      <p className="relative my-6 font-display text-6xl leading-none sm:text-4xl md:text-[4rem]">
        <RisingWords text="The Grand Finale" />
      </p>

      <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.1em]">
        30 Oct 2026 (Fri), 7PM to 10PM 
      </motion.p>
      <motion.p variants={fadeUp} className="text-xs mt-4 font-bold tracking-[0.1em]">
        Doors Open at 6:30PM for corridor booths
      </motion.p>
      <motion.p variants={fadeUp} className="relative mt-6 max-w-xl text-left text-base leading-relaxed sm:text-md">
        The Grand Finale is a once-in-a-generation stage performance held in the city of Monad. This year, you, our esteemed guest, are cordially invited to witness this seminal occasion.
      </motion.p>
      <motion.p variants={fadeUp} className="relative mt-2 max-w-xl text-left text-base leading-relaxed sm:text-md">
        Experience immersive room activities, a stamp rally with prizes, a merch shrine for photo-taking, and lots of sweets and chocolates from trick-or-treating!
      </motion.p>
      <motion.p variants={fadeUp} className="relative mt-2 max-w-xl text-left text-base leading-relaxed sm:text-md">
          This event is free but sign-up only. Sign up by 28 Oct (Wed) 23:59 to secure your spot!
      </motion.p>
      <SignUpButton variant="cut" className="mt-8" />
      </div>
      <motion.div variants={fadeUp} className="mt-6 flex h-10 shrink-0 flex-col items-center gap-2 text-text-muted">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" />
      </motion.div>
    </motion.header>
  )
}

const HERO_POSTER = '/images/halloween/the-grand-finale.webp'

/**
 * Sits behind the hero text: the poster as a framed card tilted in 3D — right
 * edge swung towards the viewer, with a slight clockwise lean.
 */
function HeroBackdrop() {
  const reduce = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-25 lg:justify-end lg:pr-6 lg:opacity-60">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative aspect-[3/4] h-[52vh] max-h-[720px] rounded-2xl bg-[#0b0910] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/25 lg:h-[68vh]"
            style={{ transform: 'perspective(1600px) rotateY(-24deg) rotateX(4deg) rotateZ(2deg)' }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <Image src={HERO_POSTER} alt="" fill sizes="(min-width: 1024px) 40vw, 60vw" priority className="object-cover" />
              {/* Glare across the glass */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Chapter({
  item,
  index,
  total,
  onActive,
}: {
  item: HalloweenInfographic
  index: number
  total: number
  onActive: (index: number) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  // The chapter crossing the middle of the viewport drives the pinned image.
  const isCentered = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (isCentered) onActive(index)
  }, [isCentered, index, onActive])

  // Scroll-linked drift: text eases in from below and out above.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [80, 0, 0, -80])

  return (
    <article
      ref={ref}
      aria-label={`${index + 1} of ${total}: ${item.title}`}
      className="relative flex flex-col justify-center py-20 lg:min-h-screen lg:py-0"
    >
      <motion.div
        style={reduce ? undefined : { opacity, y }}
        initial={reduce ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ amount: 0.4 }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        className="relative"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-2 -top-20 select-none font-serif text-[9rem] font-bold leading-none text-transparent opacity-30 sm:text-[12rem]"
          style={{ WebkitTextStroke: '1px var(--color-accent)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <motion.p variants={fadeUp} className="relative text-xs font-bold uppercase tracking-[0.35em] text-accent-gold">
          {item.kicker}
        </motion.p>
        <div className="relative flex items-center justify-between gap-4">
          <p className="relative mt-4 font-display text-6xl leading-[0.95] text-foreground sm:text-7xl xl:text-8xl">
            <RisingWords text={item.title} />
          </p>

          <motion.a
            variants={fadeUp}
            href={item.instagram ?? INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Instagram (opens in a new tab)"
            className="group mt-4 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 py-2.5 text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </motion.a>
        </div>
        <div className="relative max-w-md space-y-2">
          {item.body.map((paragraph, i) => (
            <motion.p key={i} variants={fadeUp} className="text-base leading-relaxed text-text-muted sm:text-lg">
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Inline infographics (small screens) */}
        <motion.div variants={fadeUp} className="relative mt-10 flex justify-center lg:hidden">
          <Infographics item={item} layout="inline" priority={index === 0} />
        </motion.div>
      </motion.div>
    </article>
  )
}

function PinnedImage({ items, active }: { items: HalloweenInfographic[]; active: number }) {
  const reduce = useReducedMotion()
  const item = items[active]

  return (
    <div className="relative flex h-full items-center justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[15%] rounded-full bg-accent opacity-25 blur-[100px]"
      />
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04, rotate: 2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Infographics item={item} layout="pinned" priority={active === 0} />
        </motion.div>
      </AnimatePresence>

      {/* Progress ticks */}
      <ol aria-hidden="true" className="absolute -right-6 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        {items.map((it, i) => (
          <li
            key={it.id}
            className={`w-1 rounded-full transition-all duration-500 ${
              i === active ? 'h-8 bg-accent' : 'h-3 bg-border'
            }`}
          />
        ))}
      </ol>
    </div>
  )
}

/** Tilt, in degrees, of each infographic in a pair — one leans left, the other right. */
const PAIR_TILT = 12
/** How far each of a pair sits from the centre, as a share of the frame's width. */
const PAIR_SHIFT = 16

/**
 * A chapter's infographics. One sits upright; two fan out, overlapping at
 * opposite tilts. Both react to hover but keep their stacking order — the
 * second always sits in front.
 */
function Infographics({
  item,
  layout,
  priority,
}: {
  item: HalloweenInfographic
  /** `pinned` fills the sticky panel's height; `inline` fills the column's width. */
  layout: 'pinned' | 'inline'
  priority?: boolean
}) {
  const images = item.images?.slice(0, 2) ?? []

  if (images.length < 2) {
    const className = layout === 'pinned' ? 'h-full w-auto max-w-full' : 'h-auto w-full max-w-sm'
    return images[0] ? (
      <Picture
        image={images[0]}
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 384px"
        className={className}
      />
    ) : (
      <Placeholder label={item.title} className={className} />
    )
  }

  return (
    <div className={layout === 'pinned' ? 'relative h-full w-full' : 'relative aspect-square w-full max-w-md overflow-x-clip'}>
      {images.map((image, i) => {
        const side = i === 0 ? -1 : 1
        return (
          <div
            key={i}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ transform: `translate(${side * PAIR_SHIFT}%, ${side * 3}%) rotate(${side * PAIR_TILT}deg)` }}
          >
            <Picture
              image={image}
              priority={priority}
              sizes="(min-width: 1024px) 30vw, 260px"
              className={`pointer-events-auto w-auto transition-transform duration-300 hover:scale-[1.03] ${
                layout === 'pinned' ? 'h-[78%] max-w-[62%]' : 'h-[70%] max-w-[54%]'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}

function Picture({
  image,
  priority,
  sizes,
  className,
}: {
  image: InfographicImage
  priority?: boolean
  sizes: string
  className: string
}) {
  if (!image.src) return <Placeholder label={image.alt} className={className} />

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={`rounded-2xl object-contain shadow-2xl shadow-black/60 ${className}`}
    />
  )
}

function Placeholder({ label, className }: { label: string; className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex aspect-[3/4] items-center justify-center rounded-3xl border border-dashed border-white/20 bg-[#1a1324] shadow-2xl shadow-black/60 ${className}`}
      style={{
        backgroundImage: 'repeating-linear-gradient(-55deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px)',
      }}
    >
      <span className="px-6 text-center font-display text-4xl text-white/50">{label}</span>
    </div>
  )
}

function Outro() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.5, once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center"
    >
      <p className="mt-6 font-display text-4xl leading-none text-accent sm:text-6xl">
        <RisingWords text="We look forward to seeing you at the premiere." />
      </p>
      <motion.p variants={fadeUp} className="mt-6 max-w-md text-base leading-relaxed text-text-muted">
        Charon — Director, The Grand Finale
      </motion.p>
      <SignUpButton variant="cut" className="mt-8" />
    </motion.section>
  )
}

/**
 * Opens the Halloween sign-up Google Form in a new tab. `cut` matches the
 * angled call-to-action on the /forms cards; `pill` is the rounded version.
 */
function SignUpButton({ variant = 'pill', className = '' }: { variant?: 'cut' | 'pill'; className?: string }) {
  if (variant === 'cut') {
    return (
      <motion.a
        variants={fadeUp}
        href={SIGN_UP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group clip-cut cut-sm relative inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover ${className}`}
      >
        Sign up for Halloween!
        <svg
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span className="sr-only">(opens Google Form in a new tab)</span>
      </motion.a>
    )
  }

  return (
    <motion.a
      variants={fadeUp}
      href={SIGN_UP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-accent/30 transition-colors hover:bg-accent-hover ${className}`}
    >
      Sign up
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span className="sr-only">(opens Google Form in a new tab)</span>
    </motion.a>
  )
}

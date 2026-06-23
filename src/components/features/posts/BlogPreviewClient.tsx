'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from './BlogPreview'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostWithExcerpt extends BlogPost {
  excerpt: string
}

interface BlogPreviewClientProps {
  posts: PostWithExcerpt[]
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -30, y: 10 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 90, damping: 15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 95, damping: 15 },
  },
}

// ─── Type Badge Colors ─────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  news:      { label: 'News',      classes: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  review:    { label: 'Review',    classes: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  essay:     { label: 'Essay',     classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  interview: { label: 'Interview', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
}

// ─── Tilt Card Wrapper ─────────────────────────────────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { damping: 25, stiffness: 180, mass: 0.5 }
  const xS = useSpring(x, spring)
  const yS = useSpring(y, spring)
  const rotateX = useTransform(yS, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(xS, [-0.5, 0.5], [-10, 10])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - left - width / 2) / width)
    y.set((e.clientY - top - height / 2) / height)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative h-full w-full ${className}`}
      >
        <div style={{ transform: 'translateZ(0px)' }} className="h-full w-full flex flex-col">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Blog Post Card ────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: PostWithExcerpt }) {
  const typeStyle = TYPE_STYLES[post.type] ?? TYPE_STYLES.news
  const date = new Date(post.published_at).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full w-full group">
      <TiltCard className="club-card group flex flex-col chaos-card-active cursor-pointer">

        {/* ── Cover Image ── */}
        <div className="relative h-48 w-full overflow-hidden border-b border-border flex-shrink-0">
          {post.cover_image_key ? (
            <Image
              src={post.cover_image_key}
              alt={post.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/10 via-background to-accent/5 flex items-center justify-center">
              <svg className="w-12 h-12 text-accent/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6-4h.01M9 16h.01M9 12h.01M12 12h.01M12 16h.01M16 12h.01M16 16h.01" />
              </svg>
            </div>
          )}

          {/* "NEW" badge — shown for posts published within the last 14 days */}
          {(Date.now() - new Date(post.published_at).getTime()) < 14 * 24 * 60 * 60 * 1000 && (
            <span className="absolute top-2 left-2 text-[9px] uppercase font-extrabold tracking-wider bg-accent text-white px-2 py-0.5 rounded-sm shadow">
              NEW
            </span>
          )}

          {/* Type badge */}
          <span className={`absolute top-2 right-2 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-sm border backdrop-blur-sm ${typeStyle.classes}`}>
            {typeStyle.label}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-grow p-5">
          {/* Title */}
          <h3 className="text-lg font-black text-foreground line-clamp-2 group-hover:text-accent transition-colors mb-2">
            {post.title}
          </h3>

          {/* Footer: badge + date */}
          <div className="mt-auto pt-4 flex items-center justify-between text-[10px]">
            <span className={`uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-sm border ${typeStyle.classes}`}>
              {typeStyle.label}
            </span>
            <span className="text-text-muted font-semibold tabular-nums">
              {date}
            </span>
          </div>
        </div>

      </TiltCard>
    </Link>
  )
}

// ─── Placeholder Card ──────────────────────────────────────────────────────────

function BlogPlaceholderCard() {
  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col overflow-hidden border border-dashed border-border bg-surface min-h-[280px]"
    >
      <div className="h-48 w-full bg-gradient-to-br from-border/50 to-surface- flex items-center justify-center border-b border-border">
        <svg className="w-10 h-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
        </svg>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-3/4 rounded bg-border/60 animate-pulse" />
          <div className="h-2 w-full rounded bg-border/40 animate-pulse" />
          <div className="h-2 w-5/6 rounded bg-border/40 animate-pulse" />
        </div>
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="h-4 w-14 rounded bg-border/60 animate-pulse" />
          <div className="h-4 w-16 rounded bg-border/40 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function BlogPreviewClient({ posts }: BlogPreviewClientProps) {
  const hasPosts = posts.length > 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="w-full"
    >
      {/* Section Header */}
      <motion.div
        variants={headerVariants}
        className="flex flex-col sm:flex-row items-baseline justify-between border-b border-border pb-4 mb-8"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl tracking-tight text-text">
            Latest Articles
          </h2>
          <p className="text-sm text-text-muted mt-1">
            News, reviews, essays and interviews from our members
          </p>
        </div>
        {hasPosts && (
          <Link
            href="/blog"
            className="text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover transition-colors mt-2 sm:mt-0"
          >
            All Articles &rarr;
          </Link>
        )}
      </motion.div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hasPosts
          ? posts.map((post) => <BlogCard key={post.id} post={post} />)
          : [1, 2, 3].map((i) => <BlogPlaceholderCard key={i} />)}
      </div>
    </motion.div>
  )
}

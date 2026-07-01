'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import type { BlogPost } from './BlogPreview'
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon'

interface PostWithExcerpt extends BlogPost {
  excerpt: string
}

interface BlogPreviewClientProps {
  posts: PostWithExcerpt[]
}

// Fixed interface to include the featured prop passed by the parent component
interface BlogCardProps {
  post: PostWithExcerpt
  featured?: boolean
}

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

const TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  news:      { label: 'News',      classes: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  review:    { label: 'Review',    classes: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  essay:     { label: 'Essay',     classes: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  interview: { label: 'Interview', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
}

function BlogCard({ post, featured = false }: BlogCardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const typeStyle = TYPE_STYLES[post.type] ?? TYPE_STYLES.news

  // Prevent hydration errors by only calculating dates after mounting on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const date = isMounted
    ? new Date(post.published_at).toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  const isNew = isMounted
    ? Date.now() - new Date(post.published_at).getTime() < 14 * 24 * 60 * 60 * 1000
    : false

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full w-full group">
      <div className="club-card card--variant-gold flex flex-col chaos-card-active h-full">

        {/* Adjust visual balance if the card is featured */}
        <div className={`relative w-full overflow-hidden border-b border-border flex-shrink-0 ${featured ? 'h-48 lg:h-60' : 'h-36'}`}>
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

          {isNew && (
            <span className="absolute top-2 left-2 text-[9px] uppercase font-extrabold tracking-wider bg-accent text-white px-2 py-0.5 rounded-sm shadow">
              NEW
            </span>
          )}

          <span className={`absolute top-2 right-2 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-sm border backdrop-blur-sm ${typeStyle.classes}`}>
            {typeStyle.label}
          </span>
        </div>

        <div className="flex flex-col flex-grow p-5">
          <h3 className={`font-black text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2 ${featured ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
            {post.title}
          </h3>
          
          {featured && post.excerpt && (
            <div className="hidden md:block text-sm text-text-muted opacity-80 my-4 line-clamp-4 overflow-hidden text-left prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  h1: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  h2: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  h3: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  h4: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  h5: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  h6: ({ children }) => <h4 className="font-bold text-md mb-1">{children}</h4>,
                  a: ({ children }) => <span className="underline decoration-accent/40">{children}</span>,
                }}
              >
                {post.excerpt}
              </ReactMarkdown>
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between text-[10px]">
            <span className="text-text-muted font-semibold tabular-nums">
              {date}
            </span>

            <span
              className="font-bold text-accent group-hover:underline flex items-center gap-0.5"
            >
              <span>Read More</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

      </div>
    </Link>
  )
}

export default function BlogPreviewClient({ posts }: BlogPreviewClientProps) {
  const featuredPosts = posts.slice(0, 5)
  const hasPosts = featuredPosts.length > 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="w-full"
    >
      <motion.div
        variants={headerVariants}
        className="flex flex-col sm:flex-row items-baseline justify-between border-b border-border pb-4 mb-8"
      >
        <div>
          <span className="text-xl font-display tracking-widest text-accent">
            Archive of NUSCAS
          </span>
          <p className="text-4xl md:text-5xl tracking-tight text-text font-serif py-2">
            Articles
          </p>
          <p className="text-sm text-text-muted mt-1">
            News, reviews, essays and interviews from our members
          </p>
        </div>
        {hasPosts && (
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent hover:text-accent/80 transition-colors self-start sm:self-end"
          >
            All Articles
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </motion.div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-fr">
        {featuredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={cardVariants}
            className={
              index === 0
                ? "lg:col-span-6 lg:row-span-2"
                : "lg:col-span-3"
            }
          >
            <BlogCard
              post={post}
              featured={index === 0}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
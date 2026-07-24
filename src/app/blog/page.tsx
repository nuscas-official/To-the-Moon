import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: "Blog & Articles",
  description: "Browse news, essays, interviews, and reviews written by members of the university anime club.",
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content_mdx: string;
  type: 'news' | 'review' | 'essay' | 'interview';
  status: string;
  cover_image_key: string | null;
  published_at: string;
  author?: {
    display_name: string;
  };
}

interface BlogPageProps {
  searchParams: {
    type?: string;
  }
}

const POST_TYPES = [
  { value: 'all', label: 'All Articles' },
  { value: 'news', label: 'News' },
  { value: 'review', label: 'Reviews' },
  { value: 'essay', label: 'Essays' },
  { value: 'interview', label: 'Interviews' },
]

// Simple helper to strip MDX tags for short excerpts
function getExcerpt(content: string, length = 120): string {
  const clean = content
    .replace(/<\/?[^>]+(>|$)/g, "") // remove HTML tags
    .replace(/[#*`_\[\]()]/g, "") // remove simple Markdown formatting
    .replace(/\s+/g, " ")
    .trim()

  if (clean.length <= length) return clean
  return clean.slice(0, length) + "..."
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const activeType = searchParams.type || 'all'
  const supabase = createClient()

  let query = supabase
    .from('posts')
    .select('*, author:users(display_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (activeType !== 'all') {
    query = query.eq('type', activeType)
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
  }

  const hasPosts = posts && posts.length > 0

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in">

      {/* Title Header */}
      <div className="border-b border-border pb-6 mb-8 text-left">
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-4xl">
          Club Blog & Reviews
        </h1>
        <p className="text-base text-text-muted mt-2 max-w-2xl leading-relaxed">
          Explore news, reviews, long-form essays, and the legendary presidential interview series written by members of the NUSCAS.
        </p>
      </div>

      {/* Filter Navigation (Print Editorial style links) */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-border/60 pb-4">
        <span className="text-xs uppercase tracking-widest font-black text-text-muted mr-4">Filter:</span>
        {POST_TYPES.map((type) => {
          const isActive = activeType === type.value
          const href = type.value === 'all' ? '/blog' : `/blog?type=${type.value}`

          return (
            <Link
              key={type.value}
              href={href}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${isActive
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-muted border-border'
                }`}
            >
              {type.label}
            </Link>
          )
        })}
      </div>

      {/* Articles Grid */}
      {!hasPosts ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50">
          <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6-4h.01M9 16h.01M9 12h.01M12 12h.01M12 16h.01M16 12h.01M16 16h.01" />
          </svg>
          <h3 className="text-lg font-bold text-neutral-800">No articles found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            We couldn&apos;t find any published articles matching this category. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => {
            const publishDate = new Date(post.published_at).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })

            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between overflow-hidden border border-border bg-surface shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative h-48 w-full bg-neutral-100 overflow-hidden border-b border-border">
                    {post.cover_image_key ? (
                      <Image
                        src={post.cover_image_key}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/5 to-accent/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-accent/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6-4h.01M9 16h.01M9 12h.01M12 12h.01M12 16h.01M16 12h.01M16 16h.01" />
                        </svg>
                      </div>
                    )}
                    {/* Category Type Badge */}
                    <span className="absolute top-3 right-3 text-[10px] uppercase font-extrabold tracking-wider bg-neutral-900/80 backdrop-blur text-white px-2.5 py-1 rounded-full border border-white/10">
                      {post.type}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="text-[10px] uppercase font-bold text-accent tracking-wider">
                      {publishDate}
                    </div>

                    <h2 className="text-xl font-black text-neutral-900 tracking-tight mt-2 line-clamp-2 group-hover:text-accent transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-text-muted mt-3 line-clamp-3 leading-relaxed">
                      {getExcerpt(post.content_mdx)}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="px-6 pb-6 pt-4 mt-auto border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1.5 font-medium">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600 uppercase border border-neutral-300">
                      {post.author?.display_name ? post.author.display_name.charAt(0) : 'M'}
                    </span>
                    <span>By {post.author?.display_name || 'Member'}</span>
                  </span>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-accent group-hover:underline flex items-center gap-0.5"
                  >
                    <span>Read More</span>
                    <svg 
                      className="w-3.5 h-3.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" 
                      />
                    </svg>
                  </Link>
                </div>

              </article>
            )
          })}
        </div>
      )}

    </div>
  )
}

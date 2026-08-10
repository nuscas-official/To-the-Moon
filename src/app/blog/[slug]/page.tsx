import { createClient as createBaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return []

    const supabase = createBaseClient(url, key)
    const { data: posts } = await supabase
      .from('posts')
      .select('slug')
      .eq('status', 'published')

    if (!posts) return []

    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (err) {
    console.error('Error in generateStaticParams:', err)
    return []
  }
}

interface PostDetailPageProps {
  params: {
    slug: string;
  }
}

// Fetch helper to query post details
async function getPost(slug: string) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null

    const supabase = createBaseClient(url, key)
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:users(display_name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error || !data) {
      if (error) console.error('Error fetching post:', error)
      return null
    }
    return data
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err && (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw err
    }
    console.error('Unexpected error fetching post:', err)
    return null
  }
}

// Dynamic Meta Generation for SEO & OpenGraph
export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) {
    return {
      title: 'Article Not Found | NUSCAS',
      description: 'The requested article could not be found.'
    }
  }

  const rawContent = post.content_mdx || ''
  const excerpt = rawContent
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/[#*`_\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 150)
    .trim() + (rawContent.length > 150 ? '...' : '')

  return {
    title: `${post.title || 'Article'} | NUSCAS Blog`,
    description: excerpt,
    openGraph: {
      title: post.title || 'Article',
      description: excerpt,
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author?.display_name || 'Member'],
      images: post.cover_image_key ? [{ url: post.cover_image_key }] : [],
    }
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-SG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Date unavailable'

  return (
    <article className="w-full max-w-3xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back to Blog Link */}
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-8 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Blog</span>
      </Link>

      {/* Header Info */}
      <header className="space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-accent border border-accent/20 bg-accent/5">
          {post.type || 'article'}
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted pt-2 border-t border-border/80">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 uppercase border border-neutral-300">
              {post.author?.display_name ? post.author.display_name.charAt(0) : 'M'}
            </span>
            <span className="font-semibold text-neutral-800">By {post.author?.display_name || 'Member'}</span>
          </div>
          <span className="hidden sm:inline text-neutral-300">&bull;</span>
          <time dateTime={post.published_at || undefined}>{publishDate}</time>
        </div>
      </header>

      {/* Large Featured Image */}
      {post.cover_image_key && (
        <div className="relative w-full h-64 sm:h-[400px] overflow-hidden border border-border shadow-sm mb-10">
          <Image 
            src={post.cover_image_key} 
            alt={post.title || 'Article cover'}
            fill
            unoptimized
            className="object-cover object-center"
          />
        </div>
      )}

      {/* Compiled MDX Article Body */}
      <div className="markdown-body w-full pb-16">
        {post.content_mdx ? (
          <MDXContent source={post.content_mdx} />
        ) : (
          <p className="text-text-muted italic">No content available for this article.</p>
        )}
      </div>

    </article>
  )
}

function MDXContent({ source }: { source: string }) {
  try {
    return <MDXRemote source={source} />
  } catch (err) {
    console.error('MDX compilation error:', err)
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
        <p className="font-bold">Error rendering article content.</p>
        <p className="text-xs mt-1">The MDX content contains formatting or syntax errors.</p>
      </div>
    )
  }
}


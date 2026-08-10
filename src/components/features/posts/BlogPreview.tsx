import { createClient } from '@/lib/supabase/server'
import BlogPreviewClient from './BlogPreviewClient'
import { getExcerpt } from '@/lib/utils/excerpt'

export interface BlogPost {
  id: string
  title: string
  slug: string
  content_mdx: string
  type: 'news' | 'review' | 'essay' | 'interview'
  cover_image_key: string | null
  published_at: string
  author?: {
    display_name: string
  }
}

export default async function BlogPreview() {
  let posts: BlogPost[] = []

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, content_mdx, type, cover_image_key, published_at, author:users(display_name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5)

    if (!error && data) {
      // Supabase returns joined relations as arrays; normalise author to a single object
      posts = data.map((row) => ({
        ...row,
        author: Array.isArray(row.author) ? row.author[0] : row.author,
      })) as BlogPost[]
    }
  } catch (err) {
    console.error('BlogPreview: failed to fetch posts:', err)
  }

  // Pre-compute excerpts on the server (only needed for the featured post at index 0)
  const postsWithExcerpts = posts.map((p, index) => ({
    ...p,
    excerpt: index === 0 ? getExcerpt(p.content_mdx, 280, p.title) : '',
  }))

  return (
    <section className="w-full">
      <BlogPreviewClient posts={postsWithExcerpts} />
    </section>
  )
}

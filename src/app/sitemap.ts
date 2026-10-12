import { MetadataRoute } from 'next'
import { createClient as createBaseClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'

// Routes that actually exist and are worth indexing, with hand-set priorities.
// Events sits just under the homepage — it's the page new members land on.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/events', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/forms', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const [postsRes, eventsRes] = await Promise.allSettled([
    supabase.from('posts').select('slug, updated_at').eq('status', 'published'),
    supabase.from('events').select('slug, starts_at').neq('status', 'cancelled'),
  ])

  const posts = postsRes.status === 'fulfilled' ? postsRes.value.data ?? [] : []
  const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data ?? [] : []

  const now = new Date().toISOString()

  const routes = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const postRoutes = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at).toISOString() : now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Canonical event URLs are the real pages, not the ?event= modal links.
  const eventRoutes = events.map((event) => ({
    url: `${SITE_URL}/events/${event.slug}`,
    lastModified: event.starts_at ? new Date(event.starts_at).toISOString() : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...routes, ...postRoutes, ...eventRoutes]
}

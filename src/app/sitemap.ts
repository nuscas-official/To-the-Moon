import { MetadataRoute } from 'next'
import { createClient as createBaseClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://to-the-moon-gold.vercel.app'
  
  const supabase = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Fetch all published blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  // 2. Fetch all non-cancelled events
  const { data: events } = await supabase
    .from('events')
    .select('slug, starts_at')
    .neq('status', 'cancelled')

  // Static routes
  const routes = ['', '/blog', '/events', '/ratings', '/gallery', '/vn'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  // Dynamic post routes
  const postRoutes = (posts || []).map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Dynamic event routes
  const eventRoutes = (events || []).map((event) => ({
    url: `${siteUrl}/events/${event.slug}`,
    lastModified: event.starts_at ? new Date(event.starts_at).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...postRoutes, ...eventRoutes]
}

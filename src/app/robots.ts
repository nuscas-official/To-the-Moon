import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nuscas.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/member/', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

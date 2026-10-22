import type { Metadata } from 'next'
import ScrollStory from '@/components/seasonal/ScrollStory'
import { HALLOWEEN_INFOGRAPHICS } from '@/lib/halloweenInfographics'

// Temporary seasonal page — kept out of the sitemap and search results.
export const metadata: Metadata = {
  title: 'Halloween 2026',
  description: 'Infographics for NUSCAS Halloween 2026: The Grand Finale.',
  alternates: { canonical: '/halloween' },
  robots: { index: false, follow: true },
}

export default function HalloweenPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <ScrollStory items={HALLOWEEN_INFOGRAPHICS} />
    </div>
  )
}

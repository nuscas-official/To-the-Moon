import { createClient } from '@/lib/supabase/server'
import PublicRatingsView from '@/components/features/ratings/PublicRatingsView'
import type { Metadata } from 'next'
import type { RatingAggregate } from '@/types/ratings'

export const metadata: Metadata = {
  title: "Anime & Manga Ratings",
  description: "Browse the community rating aggregates and top picks submitted by members of the university anime club.",
}

export const revalidate = 0 // Disable cache for real-time accuracy

const STUB_RATING_AGGREGATES: RatingAggregate[] = [
  {
    anilist_id: 21459,
    media_type: 'anime',
    title_en: 'My Hero Academia',
    cover_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60',
    average_score: 8.2,
    rating_count: 14
  },
  {
    anilist_id: 30002,
    media_type: 'manga',
    title_en: 'Berserk',
    cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60',
    average_score: 9.6,
    rating_count: 24
  },
  {
    anilist_id: 101922,
    media_type: 'anime',
    title_en: 'Demon Slayer: Kimetsu no Yaiba',
    cover_image_url: null, // Tests your fallback broken image UI state
    average_score: 8.7,
    rating_count: 32
  },
  {
    anilist_id: 40005,
    media_type: 'manga',
    title_en: 'Chainsaw Man',
    cover_image_url: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150&auto=format&fit=crop&q=60',
    average_score: 8.5,
    rating_count: 3
  }
]

export default async function RatingsPage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('public_rating_aggregates')
    .select('*')
    .order('average_score', { ascending: false })

  if (error) {
    console.error('Error querying rating aggregates:', error)
  }

  const aggregates = (data as RatingAggregate[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Club Rating Aggregates
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Explore and discover the collective scores of anime and manga reviewed by our members.
        </p>
      </div>

      <PublicRatingsView initialAggregates={aggregates.length > 0 ? aggregates : STUB_RATING_AGGREGATES} />
    </div>
  )
}

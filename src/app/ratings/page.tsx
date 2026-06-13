import { createClient } from '@/lib/supabase/server'
import PublicRatingsView from '@/components/features/PublicRatingsView'

interface RatingAggregate {
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  average_score: number;
  rating_count: number;
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function RatingsPage() {
  const supabase = createClient()

  // Fetch rating aggregates from view
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
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Club Rating Aggregates
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Explore and discover the collective scores of anime and manga reviewed by our members.
        </p>
      </div>

      {/* Interactive Aggregates View */}
      <PublicRatingsView initialAggregates={aggregates} />
    </div>
  )
}

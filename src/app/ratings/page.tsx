import { createClient } from '@/lib/supabase/server'
import PublicRatingsView from '@/components/features/ratings/PublicRatingsView'
import type { Metadata } from 'next'
import type { RatingAggregate } from '@/types/ratings'
import { fetchAniListMediaDetails } from '@/lib/anilist'

export const metadata: Metadata = {
  title: "Ratings",
  description: "Browse the community rating aggregates and top picks submitted by members of the university anime club.",
}

export const revalidate = 0 // Disable cache for real-time accuracy

const STUB_RATING_AGGREGATES: RatingAggregate[] = [
  {
    anilist_id: 21459,
    media_type: 'anime',
    title_en: 'My Hero Academia',
    cover_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21459-nYh85uj2Fuwr.jpg',
    average_score: 8.2,
    rating_count: 14
  },
  {
    anilist_id: 30002,
    media_type: 'manga',
    title_en: 'Berserk',
    cover_image_url: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30002-Cul4OeN7bYtn.jpg',
    average_score: 9.6,
    rating_count: 24
  },
  {
    anilist_id: 101922,
    media_type: 'anime',
    title_en: 'Demon Slayer: Kimetsu no Yaiba',
    cover_image_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx101922-WBsBl0ClmgYL.jpg',
    average_score: 8.7,
    rating_count: 32
  },
  {
    anilist_id: 105778,
    media_type: 'manga',
    title_en: 'Chainsaw Man',
    cover_image_url: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx105778-4X322eb8259e.png',
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
  let initialAggregates = aggregates.length > 0 ? aggregates : STUB_RATING_AGGREGATES

  // Retrieve actual images from AniList for any items missing cover images or using stub placeholders
  try {
    const idsToFetch = initialAggregates.map(item => item.anilist_id)
    if (idsToFetch.length > 0) {
      const aniListDetails = await fetchAniListMediaDetails(idsToFetch)
      initialAggregates = initialAggregates.map(item => {
        const fetched = aniListDetails[item.anilist_id]
        if (fetched?.cover_image_url) {
          return {
            ...item,
            cover_image_url: fetched.cover_image_url,
            title_en: fetched.title_en || item.title_en,
          }
        }
        return item
      })
    }
  } catch (err) {
    console.error('Error retrieving AniList cover images:', err)
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
        <div className='mb-4'>
          <span className="text-xl font-display tracking-widest text-accent">
            Our taste
          </span>
          <p className="text-4xl md:text-5xl font-serif text-text tracking-tight py-2">
            Anime and Manga Ratings
          </p>
          <p className="text-sm text-text-muted mt-2 max-w-xl font-sans leading-relaxed">
            Explore the aggregate score of various anime and manga scored by our members
          </p>
        </div>

      <PublicRatingsView initialAggregates={initialAggregates} />
    </div>
  )
}


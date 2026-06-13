import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MemberRatingsDashboard from '@/components/features/MemberRatingsDashboard'

interface UserRating {
  id: string;
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  score: number;
  note: string | null;
  updated_at: string;
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function MemberRatingsPage() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Validate role
  const role = await getUserRole(supabase)
  if (role !== 'member' && role !== 'committee' && role !== 'admin') {
    redirect('/')
  }

  // 3. Fetch user's own ratings
  const { data: ratingsData, error: fetchError } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching member ratings:', fetchError)
  }

  const userRatings = (ratingsData as UserRating[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          My Ratings & Reviews
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Search for anime or manga titles, record your personal rating, and manage your reviews list below.
        </p>
      </div>

      {/* Member Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/member/articles"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
        >
          My Articles
        </Link>
        <Link
          href="/member/ratings"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent"
        >
          My Ratings
        </Link>
      </div>

      {/* Main Interactive Dashboard */}
      <MemberRatingsDashboard initialRatings={userRatings} />
    </div>
  )
}

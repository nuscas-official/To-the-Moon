import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/ratings
 * Publicly exposes aggregated rating averages from public_rating_aggregates view.
 */
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('public_rating_aggregates')
    .select('*')
    .order('average_score', { ascending: false })

  if (error) {
    console.error('Error querying public_rating_aggregates:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * POST /api/ratings
 * Authenticated endpoint for active member rating submissions.
 */
export async function POST(request: Request) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 })
  }

  // 2. Verify is_active
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Internal Server Error: Account verification failed.' }, { status: 500 })
  }
  if (!profile.is_active) {
    return NextResponse.json({ error: 'Forbidden: Account is deactivated.' }, { status: 403 })
  }

  // 3. Parse and validate JSON payload
  try {
    const body = await request.json()
    const { anilist_id, media_type, title_en, cover_image_url, score, note } = body

    if (!anilist_id || !Number.isInteger(anilist_id)) {
      return NextResponse.json({ error: 'Bad Request: anilist_id must be a valid integer.' }, { status: 400 })
    }
    const validatedScore = Math.floor(score)
    if (isNaN(validatedScore) || validatedScore < 1 || validatedScore > 10) {
      return NextResponse.json({ error: 'Bad Request: score must be a whole number between 1 and 10.' }, { status: 400 })
    }
    if (!title_en || !title_en.trim()) {
      return NextResponse.json({ error: 'Bad Request: title_en is required.' }, { status: 400 })
    }
    if (!['anime', 'manga', 'other'].includes(media_type)) {
      return NextResponse.json({ error: 'Bad Request: media_type must be anime, manga, or other.' }, { status: 400 })
    }

    // 3.5. Enforce Rate Limit: max 30 ratings submitted today per user (excluding updates of existing ratings)
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const { count, error: countError } = await supabase
      .from('ratings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString())

    if (countError) {
      console.error('Error counting ratings for rate limit:', countError)
      return NextResponse.json({ error: 'Internal Server Error: Rate limit verification failed.' }, { status: 500 })
    }

    if (count !== null && count >= 30) {
      // Check if this is an update to an existing rating for this user & anilist_id
      const { data: existingRating, error: existError } = await supabase
        .from('ratings')
        .select('id')
        .eq('user_id', user.id)
        .eq('anilist_id', anilist_id)
        .maybeSingle()

      if (existError) {
        console.error('Error checking existing rating for rate limit:', existError)
        return NextResponse.json({ error: 'Internal Server Error: Rate limit verification failed.' }, { status: 500 })
      }

      // If it doesn't exist, this is a new submission, which exceeds the limit
      if (!existingRating) {
        return NextResponse.json({ error: 'Rate Limit Exceeded: You have reached the limit of 30 review submissions per day.' }, { status: 429 })
      }
    }

    // 4. Perform database upsert
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        anilist_id,
        media_type,
        title_en: title_en.trim(),
        cover_image_url: cover_image_url || null,
        score: validatedScore,
        note: note ? note.trim() : null,
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Error upserting rating in API route:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // 5. Revalidate cache
    revalidatePath('/member/ratings')
    revalidatePath('/ratings')

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bad Request: Invalid JSON body.' },
      { status: 400 }
    )
  }
}

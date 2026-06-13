'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface RatingInput {
  anilist_id: number;
  media_type: 'anime' | 'manga' | 'other';
  title_en: string;
  cover_image_url: string | null;
  score: number;
  note: string | null;
}

/**
 * Server Action to submit or edit a rating.
 * Enforces authentication, checks is_active, and validates rating score bounds.
 */
export async function submitRatingAction(input: RatingInput) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Verify is_active state in users profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { success: false, error: 'Failed to verify member account status.' }
  }
  if (!profile.is_active) {
    return { success: false, error: 'Your account is deactivated. Action forbidden.' }
  }

  // 3. Validate input bounds
  const score = Math.floor(input.score)
  if (score < 1 || score > 10) {
    return { success: false, error: 'Rating score must be a whole number between 1 and 10.' }
  }
  if (!input.anilist_id || !Number.isInteger(input.anilist_id)) {
    return { success: false, error: 'Invalid AniList ID.' }
  }
  if (!input.title_en || !input.title_en.trim()) {
    return { success: false, error: 'Media title is required.' }
  }
  if (!['anime', 'manga', 'other'].includes(input.media_type)) {
    return { success: false, error: 'Invalid media type.' }
  }

  try {
    // 4. Upsert rating (user_id and anilist_id unique constraint guarantees single entry per title)
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        anilist_id: input.anilist_id,
        media_type: input.media_type,
        title_en: input.title_en.trim(),
        cover_image_url: input.cover_image_url || null,
        score,
        note: input.note ? input.note.trim() : null,
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Error upserting rating:', upsertError)
      return { success: false, error: upsertError.message }
    }

    revalidatePath('/member/ratings')
    revalidatePath('/ratings')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to delete an existing rating.
 * Enforces ownership check at query execution.
 */
export async function deleteRatingAction(ratingId: string) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  try {
    // 2. Delete the rating row where user_id matches
    const { error: deleteError } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting rating:', deleteError)
      return { success: false, error: deleteError.message }
    }

    revalidatePath('/member/ratings')
    revalidatePath('/ratings')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

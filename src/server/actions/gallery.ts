'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { deleteFromR2 } from '@/lib/r2'
import { revalidatePath } from 'next/cache'

interface ArtworkInput {
  storage_key: string;
  title: string | null;
  artist_credit: string;
  consent_method: 'telegram_message' | 'in_person' | 'email';
  consented_at: string;
  note?: string;
}

/**
 * Server Action to create/upload a gallery artwork and register its consent record.
 * Enforces committee or admin roles.
 */
export async function createArtworkAction(input: ArtworkInput) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate role
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  // 3. Validate inputs
  if (!input.storage_key.trim()) {
    return { success: false, error: 'Artwork image is required.' }
  }
  if (!input.artist_credit.trim()) {
    return { success: false, error: 'Artist credit is required.' }
  }
  if (!input.consent_method) {
    return { success: false, error: 'Consent method is required.' }
  }
  if (!input.consented_at) {
    return { success: false, error: 'Consent date is required.' }
  }

  try {
    // 4. Get current gallery counts to set display_order
    const { count, error: countError } = await supabase
      .from('gallery_artworks')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting gallery artworks:', countError)
      return { success: false, error: countError.message }
    }

    // 5. Insert gallery artwork record
    const { data: artwork, error: insertArtworkError } = await supabase
      .from('gallery_artworks')
      .insert({
        storage_key: input.storage_key.trim(),
        title: input.title?.trim() || null,
        artist_credit: input.artist_credit.trim(),
        uploaded_by: user.id,
        display_order: count || 0,
        status: 'visible',
      })
      .select('id')
      .single()

    if (insertArtworkError || !artwork) {
      console.error('Error inserting gallery artwork:', insertArtworkError)
      return { success: false, error: insertArtworkError?.message || 'Failed to create artwork record.' }
    }

    // 6. Insert associated consent record
    const { error: insertConsentError } = await supabase
      .from('gallery_consent')
      .insert({
        artwork_id: artwork.id,
        consented_by: user.id,
        consented_at: new Date(input.consented_at).toISOString(),
        consent_method: input.consent_method,
        artist_credit: input.artist_credit.trim(),
        note: input.note?.trim() || null,
      })

    if (insertConsentError) {
      console.error('Error inserting gallery consent:', insertConsentError)
      // Attempt recovery: delete the created artwork to avoid orphan records
      await supabase.from('gallery_artworks').delete().eq('id', artwork.id)
      return { success: false, error: `Failed to create consent record: ${insertConsentError.message}` }
    }

    // 7. Revalidate relevant paths
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')

    return { success: true, id: artwork.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to take down a gallery artwork: marks status as 'removed', records timestamps,
 * and deletes the file from R2/storage.
 * Enforces committee or admin roles.
 */
export async function takedownArtworkAction(artworkId: string) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate role
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  try {
    // 3. Fetch artwork to get storage_key before update
    const { data: artwork, error: fetchError } = await supabase
      .from('gallery_artworks')
      .select('storage_key, status')
      .eq('id', artworkId)
      .single()

    if (fetchError || !artwork) {
      return { success: false, error: 'Artwork not found.' }
    }

    if (artwork.status === 'removed') {
      return { success: false, error: 'Artwork has already been taken down.' }
    }

    // 4. Update status in gallery_artworks
    const { error: updateArtworkError } = await supabase
      .from('gallery_artworks')
      .update({ status: 'removed' })
      .eq('id', artworkId)

    if (updateArtworkError) {
      console.error('Error updating artwork status:', updateArtworkError)
      return { success: false, error: updateArtworkError.message }
    }

    // 5. Update timestamps in gallery_consent
    const now = new Date().toISOString()
    const { error: updateConsentError } = await supabase
      .from('gallery_consent')
      .update({
        removal_requested_at: now,
        removed_at: now,
      })
      .eq('artwork_id', artworkId)

    if (updateConsentError) {
      console.error('Error updating consent timestamps:', updateConsentError)
      // Note: We don't block progress since the artwork status is already 'removed'
    }

    // 6. Delete file from R2
    if (artwork.storage_key) {
      try {
        await deleteFromR2(artwork.storage_key)
      } catch (r2Err) {
        console.error('Failed to delete artwork file from R2:', r2Err)
      }
    }

    // 7. Revalidate
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

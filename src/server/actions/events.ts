'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { generateUniqueSlug } from '@/lib/utils/slug'
import { revalidatePath } from 'next/cache'
import { deleteFromR2 } from '@/lib/r2'

interface EventInput {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
}

/**
 * Server Action to create a new event.
 * Enforces committee or admin roles.
 */
export async function createEventAction(input: EventInput) {
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

  // 3. Validate input
  if (!input.title.trim()) {
    return { success: false, error: 'Title cannot be empty.' }
  }
  if (!input.starts_at) {
    return { success: false, error: 'Start date and time is required.' }
  }

  try {
    // 4. Generate unique slug
    const slug = await generateUniqueSlug(supabase, 'events', input.title)

    // 5. Insert event
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        created_by: user.id,
        title: input.title.trim(),
        slug,
        description: input.description || null,
        starts_at: input.starts_at,
        ends_at: input.ends_at || null,
        location: input.location || null,
        status: input.status,
        cover_image_key: input.cover_image_key || null,
        departments: input.departments || [],
      })
      .select('id, slug')
      .single()

    if (insertError) {
      console.error('Error inserting event:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/events')
    revalidatePath('/admin/events')
    revalidatePath('/')

    return { success: true, slug: event.slug, id: event.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to update an existing event.
 * Enforces committee or admin roles.
 */
export async function updateEventAction(id: string, input: Partial<EventInput>) {
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
    // Fetch original event to check slug or existence
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('title, slug, cover_image_key')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return { success: false, error: 'Event not found.' }
    }

    // Regenerate slug if title changes
    let slug = event.slug
    if (input.title && input.title !== event.title) {
      slug = await generateUniqueSlug(supabase, 'events', input.title)
    }

    const updateData: Partial<EventInput> & { slug?: string } = {
      ...input,
    }
    if (input.title) {
      updateData.slug = slug
      updateData.title = input.title.trim()
    }

    const { error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating event:', updateError)
      return { success: false, error: updateError.message }
    }

    // Clean up old cover image from R2 if it changed
    if (
      event.cover_image_key &&
      input.cover_image_key !== undefined &&
      input.cover_image_key !== event.cover_image_key
    ) {
      const isUploaded = event.cover_image_key.startsWith('/') || 
                         (process.env.CLOUDFLARE_R2_PUBLIC_URL && event.cover_image_key.includes(process.env.CLOUDFLARE_R2_PUBLIC_URL))
      if (isUploaded) {
        try {
          await deleteFromR2(event.cover_image_key)
        } catch (r2Err) {
          console.error('Failed to delete old event cover image from storage:', r2Err)
        }
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${event.slug}`)
    revalidatePath(`/events/${slug}`)
    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/edit/${id}`)
    revalidatePath('/')

    return { success: true, slug }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to delete an event.
 * Enforces committee or admin roles.
 */
export async function deleteEventAction(id: string) {
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
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('slug, cover_image_key')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return { success: false, error: 'Event not found.' }
    }

    // Fetch all associated photo records for R2 cleanup
    const { data: photos } = await supabase
      .from('event_photos')
      .select('storage_key')
      .eq('event_id', id)

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting event:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Clean up assets from storage
    if (event.cover_image_key) {
      try {
        await deleteFromR2(event.cover_image_key)
      } catch (err) {
        console.error('Failed to delete cover image from storage:', err)
      }
    }

    if (photos && photos.length > 0) {
      for (const photo of photos) {
        if (photo.storage_key) {
          try {
            await deleteFromR2(photo.storage_key)
          } catch (err) {
            console.error('Failed to delete event photo from storage:', err)
          }
        }
      }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${event.slug}`)
    revalidatePath('/admin/events')
    revalidatePath('/')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to add a photo URL workaround to an event gallery.
 * Enforces committee or admin roles.
 */
export async function addEventPhotoAction(eventId: string, storageKey: string, altText: string = '') {
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

  if (!storageKey.trim()) {
    return { success: false, error: 'Photo URL cannot be empty.' }
  }

  try {
    // Get current photo count to determine display_order
    const { count, error: countError } = await supabase
      .from('event_photos')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (countError) {
      console.error('Error counting event photos:', countError)
      return { success: false, error: countError.message }
    }

    const { data: photo, error: insertError } = await supabase
      .from('event_photos')
      .insert({
        event_id: eventId,
        storage_key: storageKey.trim(),
        alt_text: altText.trim() || null,
        display_order: count || 0,
        uploaded_by: user.id,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Error inserting event photo:', insertError)
      return { success: false, error: insertError.message }
    }

    // Fetch the event slug to revalidate page
    const { data: event } = await supabase
      .from('events')
      .select('slug')
      .eq('id', eventId)
      .single()

    if (event) {
      revalidatePath(`/events/${event.slug}`)
    }
    revalidatePath(`/admin/events/edit/${eventId}`)

    return { success: true, photo }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to delete a photo from an event.
 * Enforces committee or admin roles.
 */
export async function deleteEventPhotoAction(photoId: string, eventId: string) {
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
    // Fetch photo info to get storage_key before delete
    const { data: photo, error: fetchPhotoError } = await supabase
      .from('event_photos')
      .select('storage_key')
      .eq('id', photoId)
      .single()

    if (fetchPhotoError || !photo) {
      return { success: false, error: 'Photo not found or already deleted.' }
    }

    const { error: deleteError } = await supabase
      .from('event_photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('Error deleting event photo:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Clean up file from storage
    if (photo.storage_key) {
      try {
        await deleteFromR2(photo.storage_key)
      } catch (err) {
        console.error('Failed to delete photo from storage:', err)
      }
    }

    // Fetch the event slug to revalidate page
    const { data: event } = await supabase
      .from('events')
      .select('slug')
      .eq('id', eventId)
      .single()

    if (event) {
      revalidatePath(`/events/${event.slug}`)
    }
    revalidatePath(`/admin/events/edit/${eventId}`)

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to reorder event photos via HTML5 Drag & Drop.
 * Enforces committee or admin roles.
 */
export async function reorderEventPhotosAction(eventId: string, photoIds: string[]) {
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
    // Perform sequential updates for the display order
    for (let i = 0; i < photoIds.length; i++) {
      const { error: updateError } = await supabase
        .from('event_photos')
        .update({ display_order: i })
        .eq('id', photoIds[i])
        .eq('event_id', eventId)

      if (updateError) {
        console.error(`Error updating order for photo ${photoIds[i]}:`, updateError)
        return { success: false, error: `Failed to update order for photo ${photoIds[i]}: ${updateError.message}` }
      }
    }

    // Fetch the event slug to revalidate page
    const { data: event } = await supabase
      .from('events')
      .select('slug')
      .eq('id', eventId)
      .single()

    if (event) {
      revalidatePath(`/events/${event.slug}`)
    }
    revalidatePath(`/admin/events/edit/${eventId}`)

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import { revalidatePath } from 'next/cache'
import { deleteFromR2 } from '@/lib/r2'
import { isSiteTheme, type SiteTheme } from '@/lib/siteTheme'

interface SeasonalPickInput {
  title: string
  accent_hex: string
  image_url: string
  /** When true, overrides the Telegram Anime of the Season vote on the homepage. */
  pinned?: boolean
}

/**
 * Server Action to update the featured Seasonal Pick.
 * Enforces admin or committee role.
 */
export async function updateSeasonalPickAction(data: SeasonalPickInput) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Enforce admin or committee role
  const role = await getUserRole(supabase)
  if (role !== 'admin' && role !== 'committee') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  // 3. Simple validation
  if (!data.title?.trim()) {
    return { success: false, error: 'Anime title is required.' }
  }
  if (!data.accent_hex?.trim() || !/^#[0-9A-Fa-f]{3,6}$/.test(data.accent_hex)) {
    return { success: false, error: 'A valid Accent Hex Color (e.g. #c82333) is required.' }
  }
  if (!data.image_url?.trim() || !/^(https?:\/\/|\/).+/.test(data.image_url)) {
    return { success: false, error: 'A valid Banner Image URL or path is required.' }
  }

  const adminClient = createAdminClient()

  try {
    // Fetch old configuration to clean up overwritten R2 image files
    const { data: oldConfig } = await adminClient
      .from('site_config')
      .select('value')
      .eq('key', 'seasonal_pick')
      .maybeSingle()

    // 4. Upsert key seasonal_pick in site_config
    const { error: upsertError } = await adminClient
      .from('site_config')
      .upsert({
        key: 'seasonal_pick',
        value: {
          title: data.title.trim(),
          accent_hex: data.accent_hex.trim(),
          image_url: data.image_url.trim(),
          pinned: data.pinned === true
        },
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      return { success: false, error: upsertError.message }
    }

    // Clean up old image if it is different and was an uploaded file
    if (oldConfig?.value) {
      const oldVal = oldConfig.value as { image_url?: string } | null
      if (oldVal?.image_url && oldVal.image_url !== data.image_url.trim()) {
        const isUploaded = oldVal.image_url.startsWith('/') || 
                           (process.env.CLOUDFLARE_R2_PUBLIC_URL && oldVal.image_url.includes(process.env.CLOUDFLARE_R2_PUBLIC_URL))
        if (isUploaded) {
          try {
            await deleteFromR2(oldVal.image_url)
          } catch (r2Err) {
            console.error('Failed to delete old seasonal banner image from storage:', r2Err)
          }
        }
      }
    }

    // 5. Log to audit log
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'settings.update_seasonal_pick',
        target_id: null,
        metadata: {
          title: data.title,
          accent_hex: data.accent_hex,
          image_url: data.image_url,
          pinned: data.pinned === true
        }
      })

    if (auditError) {
      console.error('Failed to log update_seasonal_pick to audit log:', auditError)
    }

    // 6. Revalidate pages
    revalidatePath('/')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to update the Rotating Join Reasons array.
 * Enforces admin or committee role.
 */
export async function updateJoinReasonsAction(reasons: string[]) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Enforce admin or committee role
  const role = await getUserRole(supabase)
  if (role !== 'admin' && role !== 'committee') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  // 3. Validation
  if (!Array.isArray(reasons)) {
    return { success: false, error: 'Invalid reasons payload format.' }
  }

  const cleanReasons = reasons.map(r => r.trim()).filter(Boolean)
  if (cleanReasons.length === 0) {
    return { success: false, error: 'At least one join reason is required.' }
  }

  const adminClient = createAdminClient()

  try {
    // 4. Upsert key join_reasons in site_config
    const { error: upsertError } = await adminClient
      .from('site_config')
      .upsert({
        key: 'join_reasons',
        value: cleanReasons,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      return { success: false, error: upsertError.message }
    }

    // 5. Log to audit log
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'settings.update_join_reasons',
        target_id: null,
        metadata: {
          reasons_count: cleanReasons.length
        }
      })

    if (auditError) {
      console.error('Failed to log update_join_reasons to audit log:', auditError)
    }

    // 6. Revalidate pages
    revalidatePath('/')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to switch the site-wide seasonal theme (e.g. Halloween).
 * Enforces admin or committee role.
 */
export async function updateSiteThemeAction(theme: SiteTheme) {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  const role = await getUserRole(supabase)
  if (role !== 'admin' && role !== 'committee') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  if (!isSiteTheme(theme)) {
    return { success: false, error: 'Unknown site theme.' }
  }

  const adminClient = createAdminClient()

  try {
    const { error: upsertError } = await adminClient
      .from('site_config')
      .upsert({
        key: 'site_theme',
        value: { theme },
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      return { success: false, error: upsertError.message }
    }

    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'settings.update_site_theme',
        target_id: null,
        metadata: { theme }
      })

    if (auditError) {
      console.error('Failed to log update_site_theme to audit log:', auditError)
    }

    // The theme lives on the root layout, so every page needs re-rendering.
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

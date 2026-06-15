'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper to generate a random 6-character alphanumeric code (uppercase)
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Server action to generate a single-use Telegram linking code.
 * Restricts access to authenticated users, checks if active,
 * deletes any existing codes for this user, and inserts the new one.
 */
export async function generateTelegramLinkCode() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  const adminSupabase = createAdminClient()

  // 2. Verify active state in users table
  const { data: profile, error: profileError } = await adminSupabase
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

  // 3. Generate a code
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now

  try {
    // 4. Remove any existing link codes for this user to avoid clutter
    await adminSupabase
      .from('telegram_link_codes')
      .delete()
      .eq('user_id', user.id)

    // 5. Insert the new code
    const { error: insertError } = await adminSupabase
      .from('telegram_link_codes')
      .insert({
        code,
        user_id: user.id,
        expires_at: expiresAt,
        used: false,
      })

    if (insertError) {
      console.error('Error inserting telegram link code:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/member/settings')
    return { success: true, code }
  } catch (err) {
    console.error('generateTelegramLinkCode unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Server action to unlink a Telegram account.
 * Clears the telegram_id column for the authenticated user.
 */
export async function unlinkTelegramAccount() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  const adminSupabase = createAdminClient()

  try {
    // 2. Clear telegram_id
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ telegram_id: null })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error clearing telegram_id:', updateError)
      return { success: false, error: updateError.message }
    }

    // 3. Delete any link codes for this user
    await adminSupabase
      .from('telegram_link_codes')
      .delete()
      .eq('user_id', user.id)

    revalidatePath('/member/settings')
    return { success: true }
  } catch (err) {
    console.error('unlinkTelegramAccount unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

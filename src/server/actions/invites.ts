'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to generate a new invite token.
 * Enforces admin role. Token is valid for 72 hours.
 */
export async function generateInviteAction() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate current user is an admin
  const currentRole = await getUserRole(supabase)
  if (currentRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required.' }
  }

  const adminClient = createAdminClient()

  try {
    // 3. Generate token details
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72 hours

    // 4. Insert invite token
    const { data: tokenData, error: insertError } = await adminClient
      .from('invite_tokens')
      .insert({
        token,
        expires_at: expiresAt,
        generated_by: user.id
      })
      .select('id')
      .single()

    if (insertError || !tokenData) {
      return { success: false, error: insertError?.message || 'Failed to create invite token.' }
    }

    // 5. Log to audit log
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'invite.generated',
        target_id: tokenData.id,
        metadata: { token }
      })

    if (auditError) {
      console.error('Failed to log invite.generated to audit log:', auditError)
    }

    revalidatePath('/admin/members/invites')
    return { success: true, token }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to revoke a pending invite token.
 * Enforces admin role.
 */
export async function revokeInviteAction(tokenId: string) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate current user is an admin
  const currentRole = await getUserRole(supabase)
  if (currentRole !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required.' }
  }

  const adminClient = createAdminClient()

  try {
    // 3. Check token existence and if it's already used or revoked
    const { data: inviteToken, error: fetchError } = await adminClient
      .from('invite_tokens')
      .select('*')
      .eq('id', tokenId)
      .single()

    if (fetchError || !inviteToken) {
      return { success: false, error: 'Invite token not found.' }
    }

    if (inviteToken.revoked_at) {
      return { success: false, error: 'Token is already revoked.' }
    }

    if (inviteToken.used_at) {
      return { success: false, error: 'Token has already been used and cannot be revoked.' }
    }

    // 4. Update invite token revoked_at
    const { error: updateError } = await adminClient
      .from('invite_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', tokenId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 5. Log to audit log
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'invite.revoked',
        target_id: tokenId,
        metadata: { token: inviteToken.token }
      })

    if (auditError) {
      console.error('Failed to log invite.revoked to audit log:', auditError)
    }

    revalidatePath('/admin/members/invites')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

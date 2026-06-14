'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to change a member's role.
 * Enforces admin role. Demoting an admin is guarded to ensure at least 2 active admins remain.
 */
export async function updateUserRoleAction(targetUserId: string, newRole: 'member' | 'committee' | 'admin') {
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
    // 3. Fetch target user's current role and active state
    const { data: targetUser, error: fetchError } = await adminClient
      .from('users')
      .select('role, is_active, display_name')
      .eq('id', targetUserId)
      .single()

    if (fetchError || !targetUser) {
      return { success: false, error: 'Target user not found.' }
    }

    if (targetUser.role === newRole) {
      return { success: true } // No change needed
    }

    // 4. Guard: Demoting an admin must leave at least 2 active admins
    if (targetUser.role === 'admin' && targetUser.is_active && newRole !== 'admin') {
      const { count, error: countError } = await adminClient
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true)

      if (countError) {
        return { success: false, error: 'Failed to verify admin counts.' }
      }

      if (count !== null && count <= 2) {
        return {
          success: false,
          error: `Cannot demote admin "${targetUser.display_name}". A minimum of 2 active admins must remain at all times.`
        }
      }
    }

    // 5. Update user role
    const { error: updateError } = await adminClient
      .from('users')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 6. Log to audit log
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: 'member.role_changed',
        target_id: targetUserId,
        metadata: {
          display_name: targetUser.display_name,
          previous_role: targetUser.role,
          new_role: newRole
        }
      })

    if (auditError) {
      console.error('Failed to log member.role_changed to audit log:', auditError)
    }

    revalidatePath('/admin/members')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to toggle a member's active status (deactivate / reactivate).
 * Enforces admin role. Deactivating an admin is guarded to ensure at least 2 active admins remain.
 */
export async function toggleUserActiveAction(targetUserId: string, active: boolean) {
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
    // 3. Fetch target user's current status
    const { data: targetUser, error: fetchError } = await adminClient
      .from('users')
      .select('role, is_active, display_name')
      .eq('id', targetUserId)
      .single()

    if (fetchError || !targetUser) {
      return { success: false, error: 'Target user not found.' }
    }

    if (targetUser.is_active === active) {
      return { success: true } // No change needed
    }

    // 4. Guard: Deactivating an admin must leave at least 2 active admins
    if (targetUser.role === 'admin' && !active) {
      const { count, error: countError } = await adminClient
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true)

      if (countError) {
        return { success: false, error: 'Failed to verify admin counts.' }
      }

      if (count !== null && count <= 2) {
        return {
          success: false,
          error: `Cannot deactivate admin "${targetUser.display_name}". A minimum of 2 active admins must remain at all times.`
        }
      }
    }

    // 5. Update user active status
    const { error: updateError } = await adminClient
      .from('users')
      .update({ is_active: active })
      .eq('id', targetUserId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 6. Log to audit log
    const actionName = active ? 'member.reactivated' : 'member.deactivated'
    const { error: auditError } = await adminClient
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: actionName,
        target_id: targetUserId,
        metadata: {
          display_name: targetUser.display_name,
          is_active: active
        }
      })

    if (auditError) {
      console.error(`Failed to log ${actionName} to audit log:`, auditError)
    }

    revalidatePath('/admin/members')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

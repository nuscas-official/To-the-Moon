import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const state = searchParams.get('state')

  // Parse state for token and display name if present
  let inviteToken: string | null = null
  let customDisplayName: string | null = null

  if (state) {
    if (state.includes(':')) {
      const parts = state.split(':')
      inviteToken = parts[0]
      customDisplayName = decodeURIComponent(parts[1])
    } else {
      // It might just be the token UUID
      inviteToken = state
    }
  }

  if (code) {
    const supabase = createClient()
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${origin}/?error=no-user-found`)
    }

    const adminClient = createAdminClient()

    // Retrieve the user profile from public.users
    const { data: profile, error: profileError } = await adminClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    }

    // 1. Deactivation check: If user is inactive, block and sign out
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/?reason=deactivated`)
    }

    // 2. Check if this is a brand new user signup
    // A user is new if they had no profile, or if their profile was created within the last 15 seconds.
    const isNewUser = !profile || (new Date().getTime() - new Date(profile.created_at).getTime() < 15000)

    if (isNewUser) {
      // Validate invite token
      if (!inviteToken) {
        // Sign out and delete user to prevent unauthorized signup
        await supabase.auth.signOut()
        await adminClient.auth.admin.deleteUser(user.id)
        return NextResponse.redirect(`${origin}/?reason=invite-required`)
      }

      // Query invite token details
      const { data: tokenData, error: tokenError } = await adminClient
        .from('invite_tokens')
        .select('*')
        .eq('token', inviteToken)
        .single()

      const now = new Date()
      const isTokenValid =
        !tokenError &&
        tokenData &&
        !tokenData.used_at &&
        !tokenData.revoked_at &&
        new Date(tokenData.expires_at) > now

      if (!isTokenValid) {
        // Invalid token: sign out, delete user, redirect with error
        await supabase.auth.signOut()
        await adminClient.auth.admin.deleteUser(user.id)
        return NextResponse.redirect(`${origin}/?reason=invalid-token`)
      }

      // Mark the token as used
      const { error: updateTokenError } = await adminClient
        .from('invite_tokens')
        .update({
          used_by: user.id,
          used_at: now.toISOString(),
        })
        .eq('id', tokenData.id)

      if (updateTokenError) {
        console.error('Error marking token as used:', updateTokenError)
      }

      // Update public user profile: set custom display name and set role to 'member'
      const finalDisplayName = customDisplayName || user.user_metadata?.name || user.email?.split('@')[0] || 'Member'
      const { error: updateProfileError } = await adminClient
        .from('users')
        .update({
          display_name: finalDisplayName,
          role: 'member',
          is_active: true,
        })
        .eq('id', user.id)

      if (updateProfileError) {
        console.error('Error updating profile display name:', updateProfileError)
      }

      // Log to audit log
      const { error: auditError } = await adminClient
        .from('audit_log')
        .insert({
          actor_id: user.id,
          action: 'invite.redeemed',
          target_id: tokenData.id,
          metadata: {
            token: inviteToken,
            email: user.email,
            display_name: finalDisplayName
          }
        })

      if (auditError) {
        console.error('Failed to log invite.redeemed to audit log:', auditError)
      }

      // Redirect to member ratings page for new signups
      return NextResponse.redirect(`${origin}/member/ratings?signup=success`)
    }

    // Existing user: allow login and redirect to next path
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Redirect to an error page if authentication fails
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}

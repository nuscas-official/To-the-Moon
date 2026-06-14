import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate current user is an admin
    const role = await getUserRole(supabase)
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()

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
      return NextResponse.json({ error: insertError?.message || 'Failed to create invite token' }, { status: 500 })
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

    // 6. Return the full invite URL
    const requestUrl = new URL(request.url)
    const joinUrl = `${requestUrl.origin}/join?token=${token}`

    return NextResponse.json({ success: true, token, url: joinUrl })
  } catch (err) {
    console.error('Error in invites generate route:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

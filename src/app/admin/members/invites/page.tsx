import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminInvitesClient from '@/components/features/admin/AdminInvitesClient'
import PageHeader from '@/components/ui/PageHeader'

interface InviteToken {
  id: string
  token: string
  generated_at: string
  expires_at: string
  used_at: string | null
  revoked_at: string | null
  generator?: { display_name: string }
  redeemer?: { display_name: string; email: string }
}

interface RawInviteToken {
  id: string
  token: string
  generated_at: string
  expires_at: string
  used_at: string | null
  revoked_at: string | null
  generator: { display_name: string } | { display_name: string }[] | null
  redeemer: { display_name: string; email: string } | { display_name: string; email: string }[] | null
}

export const revalidate = 0 // Run dynamically for real-time accuracy

export default async function AdminInvitesDashboard() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Enforce admin role only
  const role = await getUserRole(supabase)
  if (role !== 'admin') {
    redirect('/')
  }

  // 3. Fetch all invite tokens with generator and redeemer joins
  const { data: invitesData, error: fetchError } = await supabase
    .from('invite_tokens')
    .select(`
      id,
      token,
      generated_at,
      expires_at,
      used_at,
      revoked_at,
      generator:users!invite_tokens_generated_by_fkey(display_name),
      redeemer:users!invite_tokens_used_by_fkey(display_name, email)
    `)
    .order('generated_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching admin invite tokens:', fetchError)
  }

  // Flatten relation structures securely
  const invites: InviteToken[] = ((invitesData as unknown as RawInviteToken[]) || []).map((inv) => ({
    id: inv.id,
    token: inv.token,
    generated_at: inv.generated_at,
    expires_at: inv.expires_at,
    used_at: inv.used_at,
    revoked_at: inv.revoked_at,
    generator: Array.isArray(inv.generator)
      ? inv.generator[0]
      : inv.generator
      ? inv.generator
      : undefined,
    redeemer: Array.isArray(inv.redeemer)
      ? inv.redeemer[0]
      : inv.redeemer
      ? inv.redeemer
      : undefined
  }))

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back Link */}
      <Link 
        href="/admin/members" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Go to Members Dashboard</span>
      </Link>

      {/* Header */}
      <PageHeader
        eyebrow="Club Members"
        title="Invite Tokens"
        description="Monitor invite links, generate single-use tokens, and revoke pending invites."
        divider
      />

      {/* Invites Client Component */}
      <AdminInvitesClient initialInvites={invites} />

    </div>
  )
}

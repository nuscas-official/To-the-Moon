import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminMembersClient from '@/components/features/admin/AdminMembersClient'

interface UserProfile {
  id: string
  display_name: string
  email: string
  role: 'member' | 'committee' | 'admin'
  is_active: boolean
  created_at: string
}

export const revalidate = 0 // Run dynamically for real-time accuracy

export default async function AdminMembersDashboard() {
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

  // 3. Fetch all user profiles ordered by creation date
  const { data: usersData, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching admin users:', fetchError)
  }

  const users = (usersData as UserProfile[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Club Members & Accounts
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Promote or demote member roles, deactivate accounts, and audit member signups.
        </p>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto whitespace-nowrap">
        <Link
          href="/admin/posts"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02] rounded-t-lg"
        >
          Manage Posts
        </Link>
        <Link
          href="/admin/events"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02] rounded-t-lg"
        >
          Manage Events
        </Link>
        <Link
          href="/admin/gallery"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02] rounded-t-lg"
        >
          Manage Gallery
        </Link>
        <Link
          href="/admin/members"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent bg-accent/[0.04] rounded-t-lg"
        >
          Manage Members
        </Link>
        <Link
          href="/admin/members/invites"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02] rounded-t-lg"
        >
          Manage Invites
        </Link>
      </div>

      {/* Members Client Dashboard Table */}
      <AdminMembersClient initialUsers={users} currentUserId={user.id} />

    </div>
  )
}

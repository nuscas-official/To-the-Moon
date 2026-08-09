import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import AdminMembersClient from '@/components/features/admin/AdminMembersClient'
import PageHeader from '@/components/ui/PageHeader'

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
      <PageHeader
        eyebrow="Committee Console"
        title="Club Members"
        description="Promote or demote member roles, deactivate accounts, and audit member signups."
        divider
      />

      {/* Members Client Dashboard Table */}
      <AdminMembersClient initialUsers={users} currentUserId={user.id} />

    </div>
  )
}

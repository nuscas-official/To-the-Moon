import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import AdminNavTabs from '@/components/layout/AdminNavTabs'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Enforce committee or admin role
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    redirect('/')
  }

  const userDisplayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Administrator'

  return (
    <div className="admin-page-root w-full space-y-6 min-h-[calc(100vh-12rem)]">
      {/* Top Horizontal Admin Navigation */}
      <AdminNavTabs userDisplayName={userDisplayName} userRole={role} />
      
      {/* Main Content */}
      <main className="w-full min-w-0">
        {children}
      </main>
    </div>
  )
}

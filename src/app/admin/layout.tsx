import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'

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
    <div className="w-full flex flex-col md:flex-row gap-8 items-start min-h-[calc(100vh-12rem)]">
      {/* Lateral Admin Sidebar */}
      <AdminSidebar userDisplayName={userDisplayName} userRole={role} />
      
      {/* Content pane */}
      <main className="flex-grow w-full md:max-w-[calc(100%-16rem)] min-w-0">
        {children}
      </main>
    </div>
  )
}

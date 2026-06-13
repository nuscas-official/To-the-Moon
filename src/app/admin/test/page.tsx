import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/supabase/role'

export default async function AdminTestPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase)

  // Server-side enforcement (must be committee or admin)
  if (!user || (role !== 'committee' && role !== 'admin')) {
    redirect('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
      <div className="rounded-full bg-red-50 p-3 text-red-600">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        Admin Portal Area
      </h1>
      <p className="mt-2 text-slate-600">
        You have successfully accessed the protected committee / admin portal test route.
      </p>

      <div className="mt-8 w-full border-t border-slate-100 pt-8 text-left space-y-3 text-sm text-slate-600">
        <div><strong className="text-slate-800">Email:</strong> {user.email}</div>
        <div><strong className="text-slate-800">Display Name:</strong> {user.user_metadata?.name || 'Admin'}</div>
        <div>
          <strong className="text-slate-800">Assigned Role:</strong>{' '}
          <span className="uppercase font-bold text-xs bg-red-50 text-red-700 border border-red-100 rounded px-2 py-0.5">
            {role}
          </span>
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import AuthButton from '@/components/features/AuthButton'
import Link from 'next/link'
import { getUserRole } from '@/lib/supabase/role'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase) || 'member'
  
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto my-12 animate-fade-in">
      <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
        NUSCAS Website
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        The official anime club website and member portal of the National University of Singapore.
      </p>

      <div className="mt-10 w-full border-t border-slate-100 pt-10">
        {user ? (
          <div className="space-y-4">
            <div className="text-slate-500 text-sm font-medium">Authenticated Session</div>
            <p className="text-2xl font-bold text-slate-900">
              Welcome back, <span className="text-indigo-600">{displayName}</span>!
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
              Role: <span className="uppercase text-slate-800 font-bold">{role}</span>
            </div>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex justify-center gap-4 mt-6">
              <Link
                href="/member/test"
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                Go to Member Area
              </Link>
              {(role === 'committee' || role === 'admin') && (
                <Link
                  href="/admin/test"
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Go to Admin Area
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-slate-700 font-medium">
              Access is restricted to club members. Please sign in with Google to continue.
            </p>
            <div className="flex justify-center">
              <AuthButton user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import AuthButton from '@/components/features/AuthButton'
import Link from 'next/link'
import SeasonalBanner from '@/components/features/SeasonalBanner'
import AbsurdReasons from '@/components/features/AbsurdReasons'
import EventsPreview from '@/components/features/EventsPreview'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase)
  
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member'

  // Fetch join reasons from site_config server-side
  let joinReasons: string[] = []
  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'join_reasons')
      .single()

    if (!error && data?.value) {
      joinReasons = data.value as string[]
    }
  } catch (err) {
    console.error('Failed to fetch join reasons:', err)
  }

  return (
    <div className="w-full space-y-12 pb-16">
      {/* 1. Hero Seasonal Banner */}
      <SeasonalBanner />

      {/* Main Grid: Welcome greeting & Absurd reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Welcome Panel / Auth Greeting Card (4 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-sm fanzine-dot-grid chaos-card-active relative overflow-hidden">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              NUS Anime Club
            </h2>
            <p className="text-sm text-text-muted mt-2 leading-relaxed">
              We are a community of creatives, artists, gamers, and enthusiasts at the National University of Singapore.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/80">
            {user ? (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-accent">Active Session</div>
                  <p className="text-xl font-black text-neutral-900 mt-1">
                    Welcome back, <span className="text-accent">{displayName}</span>!
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
                  Role: <span className="uppercase">{role || 'member'}</span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/member/ratings"
                    className="rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 shadow-sm active:scale-95 transition-all"
                  >
                    Member Area
                  </Link>
                  {(role === 'committee' || role === 'admin') && (
                    <Link
                      href="/admin/dashboard"
                      className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 active:scale-95 transition-all"
                    >
                      Admin Area
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-neutral-700">
                  Access is restricted to club members. Sign in with Google to join the portal:
                </p>
                <div className="flex">
                  <AuthButton user={user} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Absurd Reasons Card (7 cols on lg) */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <AbsurdReasons initialReasons={joinReasons} />
        </div>

      </div>

      {/* 3. Events Preview */}
      <EventsPreview />
    </div>
  )
}

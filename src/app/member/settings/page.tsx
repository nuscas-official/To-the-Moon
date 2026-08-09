import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MemberSettingsClient from '@/components/features/members/MemberSettingsClient'
import PageHeader from '@/components/ui/PageHeader'

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function MemberSettingsPage() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Validate role
  const role = await getUserRole(supabase)
  if (role !== 'member' && role !== 'committee' && role !== 'admin') {
    redirect('/')
  }

  // 3. Fetch user's profile to check if Telegram is linked
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching member profile for settings:', profileError)
  }

  const telegramId = profile?.telegram_id || null
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'LunaProto_bot:'

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      {/* Header */}
      <PageHeader
        eyebrow="Member Workspace"
        title="Account Settings"
        description="Manage your portal configurations, external integrations, and Telegram bot linking."
        divider
      />

      {/* Member Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/member/articles"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02]"
        >
          My Articles
        </Link>
        <Link
          href="/member/ratings"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02]"
        >
          My Ratings
        </Link>
        <Link
          href="/member/settings"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent bg-accent/[0.04]"
        >
          Settings
        </Link>
      </div>

      {/* Settings Component */}
      <MemberSettingsClient initialTelegramId={telegramId} botUsername={botUsername} />
    </div>
  )
}

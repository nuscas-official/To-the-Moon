import { createClient } from '@/lib/supabase/server'
import PendingModerationFeed, { PendingPost } from '@/components/features/admin/PendingModerationFeed'
import Link from 'next/link'

// Simple helper to format audit log rows into human-readable strings
function formatAuditLog(log: {
  action: string
  created_at: string
  actor?: { display_name: string } | null
  metadata?: Record<string, unknown> | null
}): { text: string; timeString: string } {
  const actorName = log.actor?.display_name || 'System'
  const action = log.action
  const metadata = (log.metadata || {}) as Record<string, unknown>
  const displayName = typeof metadata.display_name === 'string' ? `@${metadata.display_name}` : 'member'
  const title = typeof metadata.title === 'string' ? `"${metadata.title}"` : 'article'

  let text = ''
  switch (action) {
    case 'member.role_changed':
      text = `${actorName} changed role of ${displayName} to ${metadata.new_role}`
      break
    case 'member.deactivated':
      text = `${actorName} deactivated member ${displayName}`
      break
    case 'member.reactivated':
      text = `${actorName} reactivated member ${displayName}`
      break
    case 'invite.generated':
      text = `${actorName} generated invite link`
      break
    case 'invite.revoked':
      text = `${actorName} revoked invite link`
      break
    case 'invite.redeemed':
      text = `${metadata.display_name || 'A new member'} redeemed invite link (${metadata.email})`
      break
    case 'blog.publish':
      text = `${actorName} published post ${title}`
      break
    case 'blog.reject':
      text = `${actorName} rejected post ${title}${metadata.reject_reason ? ` (Reason: ${metadata.reject_reason})` : ''}`
      break
    case 'blog.archive':
      text = `${actorName} archived post ${title}`
      break
    case 'blog.delete':
      text = `${actorName} deleted post ${title}`
      break
    case 'settings.update_seasonal_pick':
      text = `${actorName} updated featured seasonal pick to "${metadata.title}"`
      break
    case 'settings.update_join_reasons':
      text = `${actorName} updated homepage join reasons list (${metadata.reasons_count} items)`
      break
    default:
      text = `${actorName} performed action "${action}"`
  }

  // Format time (Singapore Time - Singapore is SGT which is UTC+8)
  const dateObj = new Date(log.created_at)
  const timeString = dateObj.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return { text, timeString }
}

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // 1. Fetch counts for stats (using head: true and count: exact for speed and efficiency)
  const [
    { count: membersCount, error: membersErr },
    { count: postsCount, error: postsErr },
    { count: eventsCount, error: eventsErr },
    { count: ratingsCount, error: ratingsErr },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('events').select('id', { count: 'exact', head: true }).gt('starts_at', new Date().toISOString()),
    supabase.from('ratings').select('id', { count: 'exact', head: true }),
  ])

  if (membersErr || postsErr || eventsErr || ratingsErr) {
    console.error('Error fetching dashboard stats counts:', {
      membersErr,
      postsErr,
      eventsErr,
      ratingsErr,
    })
  }

  // 2. Fetch last 10 rows from the audit_log table
  const { data: rawLogs, error: logsErr } = await supabase
    .from('audit_log')
    .select('id, action, target_id, metadata, created_at, actor:users!actor_id(display_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  if (logsErr) {
    console.error('Error fetching audit logs for dashboard:', logsErr)
  }

  const logs = (rawLogs || []).map((l) => {
    const logItem = l as unknown as {
      action: string
      created_at: string
      actor?: { display_name: string } | null
      metadata?: Record<string, unknown> | null
    }
    return formatAuditLog(logItem)
  })

  // 3. Fetch posts under pending_review
  const { data: pendingRaw, error: pendingErr } = await supabase
    .from('posts')
    .select('id, title, slug, type, created_at, author:users(display_name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  if (pendingErr) {
    console.error('Error fetching pending posts for moderation:', pendingErr)
  }

  const pendingPosts = (pendingRaw as unknown as PendingPost[]) || []

  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of system statistics, pending tasks, and recent operations.
        </p>
      </div>

      {/* 1. Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Members count */}
        <div className="p-5 rounded-none border border-border bg-surface shadow-sm fanzine-dot-grid flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-widest font-black">Active Members</span>
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">{membersCount ?? 0}</span>
          </div>
        </div>

        {/* Published Posts count */}
        <div className="p-5 rounded-none border border-border bg-surface shadow-sm fanzine-dot-grid flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-widest font-black">Published Posts</span>
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">{postsCount ?? 0}</span>
          </div>
        </div>

        {/* Upcoming Events count */}
        <div className="p-5 rounded-none border border-border bg-surface shadow-sm fanzine-dot-grid flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-widest font-black">Upcoming Events</span>
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">{eventsCount ?? 0}</span>
          </div>
        </div>

        {/* Total Anime Ratings count */}
        <div className="p-5 rounded-none border border-border bg-surface shadow-sm fanzine-dot-grid flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-widest font-black">Anime Ratings</span>
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.583 1.828l-3.978 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.978-2.89a1 1 0 00-1.176 0l-3.978 2.89c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.978-2.89c-.777-.577-.378-1.828.583-1.828h4.907a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">{ratingsCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 2. Main content section: Moderation Feed & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Moderation Feed (7 columns) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
              Pending Review
            </h2>
            <Link
              href="/admin/posts"
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
            >
              <span>All posts</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <PendingModerationFeed initialPosts={pendingPosts} />
        </section>

        {/* Activity Feed (5 columns) */}
        <section className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
            Activity Feed
          </h2>
          <div className="border border-border bg-surface rounded-none p-5 shadow-sm space-y-5">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">
                No recent activity logged.
              </div>
            ) : (
              <div className="relative border-l border-neutral-100 pl-4 space-y-5">
                {logs.map((log, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Activity marker point */}
                    <span className="absolute -left-[21.5px] top-1.5 w-2 h-2 bg-accent border border-white" />
                    <p className="font-semibold text-neutral-800 leading-relaxed">
                      {log.text}
                    </p>
                    <span className="text-[10px] text-text-muted block mt-0.5 font-bold">
                      {log.timeString}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

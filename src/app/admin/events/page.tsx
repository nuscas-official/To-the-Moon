import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminEventList from '@/components/features/AdminEventList'

interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function AdminEventsDashboard() {
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

  // 3. Fetch all events (including cancelled)
  const { data: events, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching admin events:', fetchError)
  }

  const allEvents = (events as ClubEvent[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back Link */}
      <Link 
        href="/admin/posts" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Go to Posts Dashboard</span>
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            Committee Events & Activities
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Create, moderate, edit, and publish club activities and manage photo galleries.
          </p>
        </div>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/admin/posts"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
        >
          Manage Posts
        </Link>
        <Link
          href="/admin/events"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent"
        >
          Manage Events
        </Link>
      </div>

      {/* Event list dashboard */}
      <AdminEventList initialEvents={allEvents} />

    </div>
  )
}

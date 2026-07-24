import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import AdminEventList from '@/components/features/admin/AdminEventList'

interface ClubEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
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

  // Self-healing: Update past upcoming events to status = 'past' in the database
  try {
    const { error: syncError } = await supabase
      .from('events')
      .update({ status: 'past' })
      .eq('status', 'upcoming')
      .lt('starts_at', new Date().toISOString())

    if (syncError) {
      console.error('Failed to auto-sync past events:', syncError)
    }
  } catch (err) {
    console.error('Error in self-healing event status sync:', err)
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

      {/* Event list dashboard */}
      <AdminEventList initialEvents={allEvents} />

    </div>
  )
}

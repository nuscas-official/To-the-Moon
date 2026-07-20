import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EventForm from '@/components/features/events/EventForm'
import EventPhotosManager from '@/components/features/events/EventPhotosManager'
import { updateEventAction } from '@/server/actions/events'

interface AdminEditEventPageProps {
  params: {
    id: string;
  }
}

interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  status: 'upcoming' | 'past' | 'cancelled';
  cover_image_key: string | null;
  departments: string[];
}

interface EventPhoto {
  id: string;
  storage_key: string;
  alt_text: string | null;
  display_order: number;
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function AdminEditEventPage({ params }: AdminEditEventPageProps) {
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

  // 3. Fetch event to edit
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (eventError || !eventData) {
    redirect('/admin/events')
  }

  const event = eventData as ClubEvent

  // 4. Fetch event photos ordered by display_order
  const { data: photosData, error: photosError } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', params.id)
    .order('display_order', { ascending: true })

  if (photosError) {
    console.error('Error fetching event photos for edit page:', photosError)
  }

  const photos = (photosData as EventPhoto[]) || []

  // Bind the event ID to the update action
  const boundUpdateAction = updateEventAction.bind(null, params.id)

  const initialFormValues = {
    id: event.id,
    title: event.title,
    description: event.description,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    location: event.location,
    status: event.status,
    cover_image_key: event.cover_image_key,
    departments: event.departments || [],
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back Link */}
      <Link 
        href="/admin/events" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Events Dashboard</span>
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Edit Event & Photo Gallery
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Modify the event schedule and location details, and upload or reorder the memory photo gallery below.
        </p>
      </div>

      {/* Grid splits details form and photo management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Event Details Form (7 cols on lg) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-neutral-900 mb-6 border-b border-border pb-4">
              Event Configuration
            </h2>
            <EventForm 
              initialData={initialFormValues}
              onSave={boundUpdateAction}
            />
          </div>
        </div>

        {/* Event Photos Manager (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <EventPhotosManager 
            eventId={event.id}
            initialPhotos={photos}
          />
        </div>
      </div>

    </div>
  )
}

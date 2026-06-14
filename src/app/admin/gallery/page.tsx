import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminGalleryClient from './AdminGalleryClient'

interface ArtworkConsent {
  id: string;
  storage_key: string;
  title: string | null;
  artist_credit: string;
  status: 'visible' | 'removed';
  created_at: string;
  consent?: {
    consent_method: string;
    consented_at: string;
    note: string | null;
  };
}

export const revalidate = 0 // Disable cache for real-time accuracy

export default async function AdminGalleryDashboard() {
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

  // 3. Fetch all artworks joined with their consent records
  const { data: artworksData, error: fetchError } = await supabase
    .from('gallery_artworks')
    .select(`
      id,
      storage_key,
      title,
      artist_credit,
      status,
      created_at,
      consent:gallery_consent(
        consent_method,
        consented_at,
        note
      )
    `)
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching admin gallery artworks:', fetchError)
  }

interface RawArtworkQuery {
  id: string;
  storage_key: string;
  title: string | null;
  artist_credit: string;
  status: 'visible' | 'removed';
  created_at: string;
  consent: {
    consent_method: string;
    consented_at: string;
    note: string | null;
  }[];
}

// Format the query response to flatten the single consent object
  const artworks: ArtworkConsent[] = ((artworksData as unknown as RawArtworkQuery[]) || []).map((art) => ({
    id: art.id,
    storage_key: art.storage_key,
    title: art.title,
    artist_credit: art.artist_credit,
    status: art.status,
    created_at: art.created_at,
    consent: art.consent && art.consent.length > 0 ? art.consent[0] : undefined,
  }))

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
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Committee Art Gallery & Consent
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Upload member artworks, record legal consent logs, and process takedown audits.
        </p>
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
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
        >
          Manage Events
        </Link>
        <Link
          href="/admin/gallery"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent"
        >
          Manage Gallery
        </Link>
      </div>

      {/* Interactive Curation Dashboard Client Component */}
      <AdminGalleryClient initialArtworks={artworks} />

    </div>
  )
}

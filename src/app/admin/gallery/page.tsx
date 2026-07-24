import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
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

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Committee Art Gallery & Consent
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Upload member artworks, record legal consent logs, and process takedown audits.
        </p>
      </div>

      {/* Interactive Curation Dashboard Client Component */}
      <AdminGalleryClient initialArtworks={artworks} />

    </div>
  )
}

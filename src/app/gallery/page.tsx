import { createClient } from '@/lib/supabase/server'
import PublicGalleryClient from './PublicGalleryClient'

interface Artwork {
  id: string;
  storage_key: string;
  title: string | null;
  artist_credit: string;
}

export const revalidate = 60 // Cache for 60 seconds (ISR)

export async function generateMetadata() {
  return {
    title: 'Art Gallery',
    description: 'A showcase of creative fanart, illustrations, and digital artworks by NUSCAS club members.',
    openGraph: {
      title: 'NUSCAS Member Art Gallery',
      description: 'A showcase of creative fanart, illustrations, and digital artworks by NUSCAS club members.',
    },
  }
}

export default async function PublicGalleryPage() {
  const supabase = createClient()

  // Fetch only visible artworks sorted by display_order, then newest
  const { data: artworksData, error } = await supabase
    .from('gallery_artworks')
    .select('id, storage_key, title, artist_credit')
    .eq('status', 'visible')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching gallery artworks:', error)
  }

  const artworks = (artworksData as Artwork[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-neutral-900">
          Club Art Gallery
        </h1>
        <p className="text-sm sm:text-base text-text-muted mt-2">
          An editorial showcase of creative illustrations, drawings, and digital art created by members of NUSCAS.
        </p>
      </div>

      {/* Interactive Grid & Lightbox Client Component */}
      <PublicGalleryClient artworks={artworks} />

    </div>
  )
}

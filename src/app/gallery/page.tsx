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
        <div className='mb-6'>
          <span className="text-xl font-display tracking-widest text-accent">
            Member Palette
          </span>
          <p className="text-4xl md:text-5xl font-serif text-text tracking-tight py-2">
            Art Gallery
          </p>
          <p className="text-sm text-text-muted mt-2 max-w-xl font-sans leading-relaxed">
            A collection of amazing fanart, sketches, and digital illustrations crafted by the talented members of our community.
          </p>
        </div>
      {/* Interactive Grid & Lightbox Client Component */}
      <PublicGalleryClient artworks={artworks} />

    </div>
  )
}

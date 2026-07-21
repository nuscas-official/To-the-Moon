import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import SeasonalBanner from '@/components/features/homepage/SeasonalBanner'
import SocialLinks from '@/components/features/homepage/SocialLinks'
import WelcomePanel from '@/components/features/homepage/WelcomePanel'
import EventsPreview from '@/components/features/events/EventsPreview'
import BlogPreview from '@/components/features/posts/BlogPreview'
import ClubDepartments from '@/components/features/homepage/ClubDepartments'
import RollingGallery from '@/components/features/homepage/RollingGallery'
import type { Metadata } from 'next'
import ParticleCanvas from '@/components/ParticleCanvas'
import WordFieldCanvas from '@/components/WordFieldCanvas'
import InteractiveFlipbook from '@/components/features/homepage/InteractiveFlipbook'

export const metadata: Metadata = {
  title: "Home | NUSCAS",
  description: "Welcome to the official member portal of NUS Comics and Animation Society. Submit ratings, discover events, read blogs, and explore our gallery.",
}

interface HomeProps {
  searchParams?: {
    reason?: string
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = await getUserRole(supabase)

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member'
  const reason = searchParams?.reason

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

  // Fetch artworks for Rolling Gallery
  let artworks: { id: string; storage_key: string; title: string | null; artist_credit: string }[] = []
  try {
    const { data: artworksData, error } = await supabase
      .from('gallery_artworks')
      .select('id, storage_key, title, artist_credit')
      .eq('status', 'visible')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && artworksData) {
      artworks = artworksData
    }
  } catch (err) {
    console.error('Failed to fetch gallery artworks:', err)
  }

  return (
    <div className="w-full pb-16">
      {/* Toast / Banner Notifications */}
      {reason && (
        <div className="w-full animate-fade-in text-left mb-8">
          {reason === 'deactivated' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Your account has been deactivated. Please contact an administrator if you believe this is an error.</span>
            </div>
          )}
          {reason === 'invite-required' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Registration to the portal is invite-only. You must use a valid invitation link to sign up.</span>
            </div>
          )}
          {reason === 'invalid-token' && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>The invitation link you used is invalid, expired, or has already been redeemed.</span>
            </div>
          )}
        </div>
      )}

      {/* Hero Section: Unified Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch my-4 gap-2">
        <div className="lg:col-span-8 flex">
          <InteractiveFlipbook className="h-full min-h-[350px] lg:min-h-[480px]" />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-2 justify-between">

          <WelcomePanel user={user} role={role} displayName={displayName} className="flex-grow" texts={joinReasons} />

          <div className="flex-shrink-0 grid grid-cols-2 gap-2">
            <SocialLinks className="py-0 h-full" />
            <SeasonalBanner className="h-full min-h-[220px]" />
          </div>
        </div>

      </div>

      {/* Outer container remains full-bleed across all screen sizes */}
      <div className="theme-crimson w-screen relative left-1/2 -translate-x-1/2 bg-background-dark text-text-dark border-y border-border-dark py-14 [--color-text:var(--color-text-dark)] [--color-foreground:var(--color-text-dark)] [--color-border:var(--color-border-dark)] [--color-surface:var(--color-surface-dark)] [--color-text-muted:var(--color-text-muted-dark)] transition-colors duration-300">
        <ParticleCanvas
          count={400}
          magnetRadius={100}
          ringRadius={70}
          waveSpeed={0.6}
          waveAmplitude={1}
          particleSize={4}
          lerpSpeed={0.055}
          autoAnimate
          pulseSpeed={2.5}
          fieldStrength={15}
        />

        <div id="events-section" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
          <EventsPreview />
        </div>

        <div id="departments-section" className="relative z-10 max-w-7xl mx-auto mt-20 pb-4 px-6 sm:px-8 lg:px-8">
          <ClubDepartments />
        </div>
      </div>

      <div id="gallery-section" className="w-screen relative left-1/2 -translate-x-1/2">
        <RollingGallery artworks={artworks} />
      </div>

      <div id="blog-section" className="w-screen relative left-1/2 -translate-x-1/2 pt-20 pb-40 bg-white">
        <img
          src="/images/word-field.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto pt-8 pb-4 px-6 sm:px-8 lg:px-8">
          <BlogPreview />
        </div>
      </div>


    </div>
  )
}

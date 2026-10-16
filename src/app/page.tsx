import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SeasonalBanner from '@/components/features/homepage/SeasonalBanner'
import SocialLinks from '@/components/features/homepage/SocialLinks'
import WelcomePanel from '@/components/features/homepage/WelcomePanel'
import EventsPreview from '@/components/features/events/EventsPreview'
import NextEventHero from '@/components/features/events/NextEventHero'
import { getHeroEvent, type HeroEventResult } from '@/lib/events'
import BlogPreview from '@/components/features/posts/BlogPreview'
import ClubDepartments from '@/components/features/homepage/ClubDepartments'
import RollingGallery from '@/components/features/homepage/RollingGallery'
import type { Metadata } from 'next'
import ParticleCanvas from '@/components/ParticleCanvas'
import WordFieldCanvas from '@/components/WordFieldCanvas'
import PageStrip from '@/components/features/homepage/PageStrip'
import CTASection from '@/components/features/homepage/CTASection'
import FeaturedVideo from '@/components/features/homepage/FeaturedVideo'
import DiagonalEdge from '@/components/features/homepage/DiagonalEdge'
import ScrollHint from '@/components/features/homepage/ScrollHint'

// Shared slant height for every section transition, so the diagonals stay consistent.
const EDGE = { '--edge': 'clamp(2rem, 5vw, 5rem)' } as React.CSSProperties

// `absolute` opts out of the root layout's "%s | NUSCAS" template, which
// would otherwise render "NUSCAS ... | NUSCAS".
export const metadata: Metadata = {
  title: { absolute: "NUSCAS | NUS Comics and Animation Society" },
  description:
    "The NUS anime, manga, and cosplay society. See what's on this semester — screenings, art workshops, gaming tournaments, and socials — plus member art, reviews, and blogs.",
  alternates: { canonical: "/" },
}

interface HomeProps {
  searchParams?: {
    reason?: string
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const startTime = performance.now()
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  // Execute auxiliary queries concurrently using Promise.allSettled for maximum fault-tolerance
  const [joinReasonsRes, artworksRes, heroRes] = await Promise.allSettled([
    supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'join_reasons')
      .single(),
    supabase
      .from('gallery_artworks')
      .select('id, storage_key, title, artist_credit')
      .eq('status', 'visible')
      .order('created_at', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(15),
    getHeroEvent()
  ])

  let joinReasons: string[] = []
  if (joinReasonsRes.status === 'fulfilled' && !joinReasonsRes.value.error && joinReasonsRes.value.data?.value) {
    joinReasons = joinReasonsRes.value.data.value as string[]
  }

  let artworks: { id: string; storage_key: string; title: string | null; artist_credit: string }[] = []
  if (artworksRes.status === 'fulfilled' && !artworksRes.value.error && artworksRes.value.data) {
    artworks = artworksRes.value.data
  }

  const hero: HeroEventResult =
    heroRes.status === 'fulfilled' ? heroRes.value : { event: null, isUpcoming: false }

  if (process.env.NODE_ENV === 'development') {
    const elapsed = (performance.now() - startTime).toFixed(1)
    console.log(`[Perf] Homepage Server SSR render prepared in ${elapsed}ms`)
  }

  const reason = searchParams?.reason

  return (
    <div className="w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch mt-10 lg:mt-12 mb-8 gap-2">
        <div className="lg:col-span-8 flex">
          <NextEventHero
            event={hero.event}
            isUpcoming={hero.isUpcoming}
            className="h-full min-h-[420px] lg:min-h-[520px] w-full"
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-2 justify-between">

          <WelcomePanel className="flex-grow" texts={joinReasons} />

          <div className="flex-shrink-0 grid grid-cols-2 gap-2">
            <SocialLinks className="py-0 h-full" />
            <SeasonalBanner className="h-full min-h-[220px]" />
          </div>
        </div>

      </div>

      {/* Outer container remains full-bleed across all screen sizes */}
      <div style={EDGE} className="theme-crimson w-screen relative left-1/2 -translate-x-1/2 bg-background-dark text-text-dark pt-[calc(var(--edge)+3.5rem)] pb-[calc(var(--edge)+3.5rem)] [--color-text:var(--color-text-dark)] [--color-foreground:var(--color-text-dark)] [--color-border:var(--color-border-dark)] [--color-surface:var(--color-surface-dark)] [--color-text-muted:var(--color-text-muted-dark)] transition-colors duration-300">
        {/* Boundary 1 of the alternating run: leans right, then flips each transition down the page. */}
        <DiagonalEdge position="top" slant="right" fill="var(--color-background)" line="color-mix(in srgb, var(--color-accent) 55%, transparent)" />
        <DiagonalEdge position="bottom" slant="left" fill="var(--color-background)" line="color-mix(in srgb, var(--color-accent) 55%, transparent)" />

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

        {/* scroll-mt clears the sticky header when the hero button or the
            ScrollHint jumps here. */}
        <div id="events-section" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 scroll-mt-24">
          <EventsPreview />
        </div>

        <div id="departments-section" className="relative z-10 max-w-7xl mx-auto mt-20 pb-4 px-6 sm:px-8 lg:px-8">
          <ClubDepartments />
        </div>
      </div>

            <section id="story-section" className="max-w-8xl mx-auto mt-20 mb-20 px-6 sm:px-8 lg:px-8">
        <div className="border-b border-border pb-4 mb-8">
          <span className="text-xl font-display tracking-widest text-accent">
            Since 1999
          </span>
          <p className="text-4xl md:text-5xl tracking-tight text-foreground font-serif py-2">
            Old Stories
          </p>
          <p className="text-sm text-text-muted mt-2">
            Twenty-five years of questionable decisions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 flex">
            <PageStrip className="h-full min-h-[350px] lg:min-h-[480px]" />
          </div>

          <div className="lg:col-span-5 flex">
            <FeaturedVideo
              videoId="Z15XT6Q74LE"
              title="NUSCAS Presidential Interviews"
              blurb="Interviewing 2 of our ex-Presidents in this (hopefully) new annual tradition at our summer BBQ!"
              className="h-full lg:min-h-[480px]"
            />
          </div>
        </div>
      </section>


      <div id="gallery-section" className="w-screen relative left-1/2 -translate-x-1/2">
        <RollingGallery artworks={artworks} />
      </div>

      <div id="blog-section" style={EDGE} className="w-screen relative left-1/2 -translate-x-1/2 pt-[calc(var(--edge)+5rem)] pb-[calc(var(--edge)+10rem)] bg-white overflow-hidden">
        {/* Picks the run back up: right again after the gallery's left-leaning boundary. */}
        <DiagonalEdge position="top" slant="right" fill="var(--color-background)" line="var(--color-border)" />
        <DiagonalEdge position="bottom" slant="left" fill="var(--color-background)" line="var(--color-border)" />

        {/* Repeated-word texture drawn to canvas — crisper than the old webp at
            any DPR. Mobile gets fewer, larger words (see component) for perf. */}
        <WordFieldCanvas fontSize={12} rowGap={40} wordGap={40} skipChance={0.12} color="#000000" />

        <div className="relative z-10 max-w-7xl mx-auto pt-8 pb-4 px-6 sm:px-8 lg:px-8">
          <BlogPreview />
        </div>
      </div>

      {/* CTA Section */}
      <CTASection />

      <ScrollHint />

    </div>
  )
}

'use client'

import Image from 'next/image'
import WelcomeTextTicker from './WelcomeTextTicker'

interface WelcomePanelProps {
  className?: string
  texts?: string[]
}

export default function WelcomePanel({
  className = "",
  texts = []
}: WelcomePanelProps) {
  return (
    <div className={`club-card flex flex-col justify-between px-6 py-4 sm:px-8 border border-border shadow-sm relative !overflow-visible ${className}`}>
      <div className="absolute md:-top-8 md:-right-12 -top-4 -right-4 md:w-24 md:h-24 w-20 h-20 pointer-events-none select-none z-10">
        <Image
          src="/images/anitan-thumbs-up.webp"
          alt="Anitan"
          fill
          sizes="(max-w-800px) 128px, 160px"
          className="object-right-top"
          priority
        />
      </div>

      <div className="relative z-0">
        {/* The page's only h1. It has to be real text — the ticker below splits
            every character into its own span, so crawlers see nothing there. */}
        <h1 className="px-2 pr-16 md:pr-20 text-xl sm:text-2xl font-serif leading-tight tracking-tight text-foreground">
          NUS Comics &amp; Animation Society
        </h1>

        <WelcomeTextTicker texts={texts} />

        <section className="w-full max-w-3xl mx-auto px-2 space-y-2 animate-fade-in">
          <p className="text-xs sm:text-base text-text-muted leading-relaxed">
            NUS Comics and Animation Society (NUSCAS) is home for all things anime, manga, games, cosplay, and Japanese pop culture!
          </p>
          <p className="text-xs sm:text-base leading-relaxed">
            In the past year alone, we&apos;ve hosted cosplay wig styling and makeup workshops, a deep-dive media analysis of <i>Frieren</i>, Japan travel sharing sessions, an anime-themed Dungeons &amp; Dragons campaign, an Uma Musume tournament, a journey through the works of <i>Hayao Miyazaki</i>, painting sessions, booths at two conventions, and even produced two original visual novel-style animatics!
          </p>
        </section>
      </div>

    </div>
  )
}
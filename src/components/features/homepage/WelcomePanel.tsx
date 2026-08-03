'use client'

import { type User } from '@supabase/supabase-js'
import Image from 'next/image'
import WelcomeTextTicker from './WelcomeTextTicker'

interface WelcomePanelProps {
  user: User | null
  role: string | null
  displayName: string
  className?: string
  texts?: string[]
}

export default function WelcomePanel({
  user,
  role,
  displayName,
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
        <WelcomeTextTicker texts={texts} />

        <section className="w-full max-w-3xl mx-auto px-2 space-y-2 animate-fade-in">
          <p className="text-sm sm:text-base leading-relaxed">
            NUS Comics and Animation Society (NUSCAS) is home for all things anime, manga, games, cosplay, and Japanese pop culture!
          </p>
          <p className="text-sm sm:text-base leading-relaxed">
            In the past year alone, we&apos;ve hosted <b>cosplay wig styling and makeup workshops</b>, a <b>deep-dive media analysis of <i>Frieren</i></b>, <b>Japan travel sharing sessions</b>, an <b>anime-themed Dungeons &amp; Dragons campaign</b>, an <b>Uma Musume tournament</b>, a <b>journey through the works of Hayao Miyazaki</b>, <b>painting sessions</b>, booths at <b>two conventions</b>, and even produced two <b>original visual novel-style animatics</b>!
          </p>
        </section>
      </div>

    </div>
  )
}
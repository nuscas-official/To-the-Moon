'use client'

import React from 'react'
import MangaCollage from './MemoriesCollage'

interface BlackGridProps {
  className?: string
}

export default function BlackGrid({ className = '' }: BlackGridProps) {
  return (
    <div 
      className={`relative w-full overflow-hidden border border-border bg-neutral-950 flex items-center p-6 md:p-10 animate-fade-in ${className}`}
    >
      
      {/* Secondary accent lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Aesthetic manga/fanzine border frame/accents */}
      <div className="absolute inset-4 border border-white/5 pointer-events-none flex flex-col justify-between p-4 z-0">
        <div className="flex justify-between text-[8px] font-mono text-white/20 tracking-widest">
          <span>SYS.LOC</span>
          <span>N_C_A_S PORTAL</span>
        </div>
        <div className="flex justify-between text-[8px] font-mono text-white/20 tracking-widest items-end">
          <span>EST. 1999</span>
          <span>[SYSTEMS OPERATIONAL]</span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Fanzine-Style Branding */}
        <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left space-y-4 lg:pr-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-accent uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>SYS.ON | MEMBER PORTAL</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-extrabold font-serif italic tracking-tight text-white leading-none">
              TO THE <span className="text-accent">MOON</span>
            </h2>
            <p className="text-[10px] text-text-muted uppercase font-mono tracking-widest">
              NUS Comics and Animation Society
            </p>
          </div>

          <p className="text-xs text-text-muted leading-relaxed font-mono border-t border-white/5 pt-3 max-w-sm">
            We are a group of friends passionate about all sorts of Japanese Animation, Comics, Events and Games. From a small club founded in 1999, we now possess hundreds of members, a dedicated committee, robust alumni network and a budding social media presence.
          </p>

          <div className="border-l-2 border-accent pl-3 text-[11px] font-mono text-white/40 italic py-1">
            This Society is registered with the Registry of Societies of Singapore.
          </div>
        </div>

        {/* Right Side: Chaotic Manga Collage */}
        <div className="col-span-1 lg:col-span-7 w-full flex items-center justify-center">
          <MangaCollage />
        </div>
      </div>

      {/* Aesthetic Border Highlight */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
    </div>
  )
}


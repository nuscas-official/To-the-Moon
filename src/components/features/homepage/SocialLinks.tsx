'use client'

import { motion } from 'framer-motion'

interface SocialLinksProps {
  className?: string
}

const socialChannels = [
  {
    name: 'Instagram',
    handle: 'nuscomicsoc',
    url: 'https://www.instagram.com/nuscomicsoc/',
    bgColor: 'hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-orange-500/10',
    borderColor: 'hover:border-pink-500/30',
    iconColor: 'text-pink-500',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    name: 'YouTube',
    handle: 'NUSCAS Productions',
    url: 'https://www.youtube.com/channel/UCKkESIjFh--HD5yOpGmm_JA',
    bgColor: 'hover:bg-red-500/10',
    borderColor: 'hover:border-red-500/30',
    iconColor: 'text-red-500',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    name: 'Linktree',
    handle: 'nuscas',
    url: 'https://linktr.ee/nuscas',
    bgColor: 'hover:bg-emerald-500/10',
    borderColor: 'hover:border-emerald-500/30',
    iconColor: 'text-emerald-400',
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.511 5.853l3.962-3.962 1.83 1.83-3.963 3.962h5.66v2.588h-5.66l3.963 3.962-1.83 1.83-3.962-3.962v5.66h-2.588v-5.66l-3.962 3.962-1.83-1.83 3.963-3.962h-5.66V7.683h5.66L7.202 3.721l1.83-1.83 3.962 3.962V0h2.588v5.853zM10.698 18.147h2.588v5.853h-2.588v-5.853z"/>
      </svg>
    )
  }
]

export default function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <div className={`w-full flex flex-col justify-stretch animate-fade-in ${className}`}>
      <div className="clip-cut cut-lg relative overflow-hidden border border-border bg-surface/40 backdrop-blur-md shadow-sm p-3.5 sm:p-4 text-left flex flex-col justify-between min-h-[220px] h-full transition-all duration-300 hover:shadow-md hover:border-accent/40 group">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
        
        {/* Header/Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-muted">
              Our Socials
            </span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2 mt-2 relative z-10">
          {socialChannels.map((channel) => (
            <motion.a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`clip-cut cut-sm flex items-center gap-2.5 py-1.5 px-2.5 sm:py-2 sm:px-2.5 border border-border/50 bg-surface/20 transition-all duration-300 ${channel.bgColor} ${channel.borderColor} group/link`}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`shrink-0 clip-cut cut-xs p-1 sm:p-1.5 bg-surface/80 group-hover/link:scale-110 transition-transform duration-300 ${channel.iconColor}`}>
                {channel.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-foreground group-hover/link:text-accent transition-colors truncate">
                  {channel.name}
                </div>
                <div className="text-[8px] text-text-muted font-mono pt-0.5 truncate">
                  {channel.handle}
                </div>
              </div>

              <div className="shrink-0 text-text-muted group-hover/link:text-accent group-hover/link:translate-x-1 transition-all duration-300">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

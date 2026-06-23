'use client'

import { motion } from 'framer-motion'

interface SocialLinksProps {
  className?: string
}

const socialChannels = [
  {
    name: 'Instagram',
    handle: '@nuscas',
    url: 'https://www.instagram.com/nuscas/',
    bgColor: 'hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-orange-500/10',
    borderColor: 'hover:border-pink-500/30',
    iconColor: 'text-pink-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    name: 'YouTube',
    handle: 'NUSCAS',
    url: 'https://www.youtube.com/@nuscas',
    bgColor: 'hover:bg-red-500/10',
    borderColor: 'hover:border-red-500/30',
    iconColor: 'text-red-500',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  {
    name: 'GitHub',
    handle: 'nuscas',
    url: 'https://github.com/nuscas',
    bgColor: 'hover:bg-neutral-800/10 dark:hover:bg-white/10',
    borderColor: 'hover:border-neutral-800/30 dark:hover:border-white/20',
    iconColor: 'text-neutral-800 dark:text-neutral-100',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    )
  }
]

export default function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <div className={`w-full flex flex-col justify-stretch animate-fade-in ${className}`}>
      <div className="relative overflow-hidden border border-border bg-surface/40 backdrop-blur-md shadow-sm p-6 text-left flex flex-col justify-between min-h-[220px] h-full transition-all duration-300 hover:shadow-md hover:border-accent/40 group chaos-card-active">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8" />
        
        {/* Header/Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-muted">
              Connect With Us
            </span>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 gap-2.5 mt-4 relative z-10">
          {socialChannels.map((channel) => (
            <motion.a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-surface/20 transition-all duration-300 ${channel.bgColor} ${channel.borderColor} group/link`}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-surface/80 border border-border/50 group-hover/link:scale-110 transition-transform duration-300 ${channel.iconColor}`}>
                  {channel.icon}
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover/link:text-accent transition-colors">
                    {channel.name}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {channel.handle}
                  </div>
                </div>
              </div>
              
              <div className="text-text-muted group-hover/link:text-accent group-hover/link:translate-x-1 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

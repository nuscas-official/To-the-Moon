'use client'

import Link from 'next/link'
import { useChaos } from '@/components/providers/ChaosProvider'

export default function Footer() {
  const { chaosMode, triggerChaosClick } = useChaos()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-text-muted">
        
        {/* Left Side: Copyright & Chaos indicator */}
        <div className="flex items-center gap-3">
          <span>&copy; {currentYear}</span>
          <button
            onClick={triggerChaosClick}
            className="font-black tracking-wider text-neutral-800 hover:text-accent focus:outline-none transition-colors select-none"
            title="Click three times to unleash something..."
          >
            NUSCAS
          </button>
          <span>All rights reserved.</span>

          {chaosMode && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent animate-pulse uppercase tracking-wider bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Chaos Active
            </span>
          )}
        </div>

        {/* Right Side: Links */}
        <div className="flex gap-6 font-medium">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
          <Link 
            href="/about" 
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            About Us
          </Link>
        </div>

      </div>
    </footer>
  )
}

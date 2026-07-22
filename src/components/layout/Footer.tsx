'use client'

import Link from 'next/link'
import { useChaos } from '@/components/providers/ChaosProvider'

export default function Footer() {
  const { chaosMode, triggerChaosClick } = useChaos()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-text-muted">
        
        {/* Left Side: Copyright & Chaos indicator */}
        <div className="flex items-center gap-1">
          <span>&copy; {currentYear}</span>
          <button
            onClick={triggerChaosClick}
            className="tracking-wider text-neutral-800 hover:text-accent focus:outline-none transition-colors select-none"
            title="Click three times to unleash something..."
          >
            NUS Comics and Animation Society.
          </button>
          <span>All rights reserved.</span>

          {chaosMode && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-accent animate-pulse uppercase tracking-wider bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Chaos Active
            </span>
          )}
        </div>
      </div>

        {/* Disclaimer & Declarations */}
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-xs leading-relaxed text-text-muted">
          <p className="font-semibold text-text">Disclaimer and Declarations</p>
          <p>
            This Society is registered with the Registry of Societies of Singapore.
            It is formed by students of the National University of Singapore and is self-governing.
            It is not part of the legal entity of the National University of Singapore. It does not
            represent the National University of Singapore and cannot act or make any representations
            on its behalf. The activities and views of this University Society are the sole
            responsibility of the Society and its members.
          </p>
      </div>
    </footer>
  )
}

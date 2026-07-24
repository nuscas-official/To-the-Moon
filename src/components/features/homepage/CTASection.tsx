'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Mail } from 'lucide-react'

interface CTASectionProps {
  className?: string
}

export default function CTASection({ className = '' }: CTASectionProps) {
  return (
    <section
      className={`relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-background text-foreground ${className}`}
    >
      {/* Grid background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26,22,22,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,22,22,0.05) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }}
      />

      {/* Corner bracket accent */}
      <div className="pointer-events-none absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-foreground/30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center"
      >

        {/* Heading */}
        <p className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] text-foreground">
          Ready to join the journey?
        </p>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-lg md:text-xl text-text-muted leading-relaxed">
          Whether you draw, write, game, or just love anime and comics, there&apos;s a
          place for you at NUSCAS.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="https://au.cglink.me/2sg/s152"
              target="_blank"
              rel="noopener noreferrer"
              className="clip-cut cut-md inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-background transition-all duration-200 hover:opacity-90 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Join NUSCAS on NUSync
              <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <span className="text-xs text-text-muted">Opens sign-up in a new tab</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Link
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nuscomicssoc@gmail.com&su=Question%20about%20NUSCAS&body=Hi%20NUSCAS%20team%2C"
              target="_blank"
              rel="noopener noreferrer"
              className="angle-frame clip-cut cut-md inline-flex items-center justify-center transition-all duration-200 hover:[--frame-color:var(--color-foreground)] hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="clip-cut inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-background text-foreground">
                Ask us about something!
                <Mail className="w-5 h-5" aria-hidden="true" />
              </span>
            </Link>
            <span className="text-xs text-text-muted">Opens email to NUSCAS</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
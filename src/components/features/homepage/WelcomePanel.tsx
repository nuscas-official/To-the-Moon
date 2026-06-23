'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthButton from '@/components/features/auth/AuthButton'
import { type User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomePanelProps {
  user: User | null
  role: string | null
  displayName: string
  className?: string
  texts?: string[]
}

const FALLBACK_REASONS = [
  "NUS Comics & Animation Society", // Moved default text here so it sits in the loop naturally
  "Free instant ramen during weekly screenings (if you can beat the president in rock-paper-scissors)",
  "We have a dedicated server to argue about whether subs or dubs are superior",
  "To fulfill your lifelong dream of running like Naruto down the university corridors",
  "Our clubroom has a shrine to the great goddess Haruhi Suzumiya",
  "To find someone who will actually watch all 1000+ episodes of One Piece with you",
  "Because writing CSS is just a visual novel with too many choices",
  "An excuse to play anime openings at maximum volume in the student lounge"
]

const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      delayChildren: 0.2,
      staggerChildren: 0.012,
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
} as const;

const letterVariants = {
  initial: { y: 15, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 200, damping: 15 } 
  },
  exit: { 
    y: -15, 
    opacity: 0, 
    transition: { duration: 0.1 } 
  }
} as const;

export default function WelcomePanel({
  user,
  role,
  displayName,
  className = "",
  texts = []
}: WelcomePanelProps) {
  // If custom texts are provided, prioritize them but preserve the main title at index 0
  const items = texts.length > 0 
    ? ["NUS Comics & Animation Society", ...texts] 
    : FALLBACK_REASONS

  const [reasonIndex, setReasonIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return

    const interval = setInterval(() => {
      setReasonIndex((prevIndex) => {
        // Pick a random next index that isn't the exact same as the current one
        let nextIndex = prevIndex
        while (nextIndex === prevIndex) {
          nextIndex = Math.floor(Math.random() * items.length)
        }
        return nextIndex
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [items])

  const displayText = items[reasonIndex]

  return (
    <div className={`club-card flex flex-col justify-between p-6 sm:p-8 border border-border shadow-sm chaos-card-active relative overflow-hidden ${className}`}>
      <div>
        {/* Dynamic Header: Highlighted changing text */}
        <div className="flex flex-col">
          <div className="min-h-[52px] sm:min-h-[64px] flex items-center relative isolation-auto">
            {/* The persistent background box that stretches dynamically */}
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="inline-block rounded-md bg-accent border border-accent/25 shadow-sm p-1.5 max-w-full"
            >
              {/* Invisible ghost text to push the layout width organically */}
              <span className="opacity-0 font-bold text-sm sm:text-base px-1.5 select-none pointer-events-none block leading-normal">
                {displayText}
              </span>

              {/* Absolute overlay container handling the staggered letter entry/exit */}
              <div className="absolute inset-0 flex items-center px-3 py-1.5">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`reason-${reasonIndex}`}
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="inline-block text-sm sm:text-base font-bold text-accent-muted max-w-full leading-normal whitespace-nowrap"
                  >
                    {displayText.split("").map((char, index) => (
                      <motion.span
                        key={index}
                        variants={letterVariants}
                        className="inline-block whitespace-pre"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed mt-4">
          We are a group of friends passionate about all sorts of Japanese Animation, Comics, Events and Games. From a small club founded in 1999, we now possess hundreds of members, a dedicated committee, robust alumni network and a budding social media presence.
        </p>
      </div>

      <div className="mt-2 pt-2 border-t border-border/80">
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="text-xl font-black mt-1">
                Welcome back, <span className="text-accent">{displayName}</span>!
              </p>
              <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
              Role: <span>{role || 'member'}</span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/member/ratings"
                className="rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs tracking-wider px-4 py-2.5 shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Member Area
              </Link>
              {(role === 'committee' || role === 'admin') && (
                <Link
                  href="/admin/posts"
                  className="rounded-xl bg-neutral-500 hover:bg-neutral-900 text-white font-bold text-xs tracking-wider px-4 py-2.5 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Admin Area
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-neutral-700">
              Access to the portal is restricted to club members. Get an invite link from an administrator to sign in with Google: 
            </p>
            <div className="flex">
              <AuthButton user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
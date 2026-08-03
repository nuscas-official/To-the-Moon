'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_REASONS = [
  "NUS Comics & Animation Society",
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
} as const

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
} as const

interface WelcomeTextTickerProps {
  texts?: string[]
  intervalMs?: number
  className?: string
}

export default function WelcomeTextTicker({
  texts = [],
  intervalMs = 3000,
  className = ""
}: WelcomeTextTickerProps) {
  // If custom texts are provided, prioritize them but preserve the main title at index 0
  const items = useMemo(() => {
    return texts.length > 0 
      ? ["NUS Comics & Animation Society", ...texts] 
      : DEFAULT_REASONS
  }, [texts])

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
    }, intervalMs)

    return () => clearInterval(interval)
  }, [items, intervalMs])

  const displayText = items[reasonIndex]

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="min-h-[52px] sm:min-h-[64px] flex items-center relative isolation-auto">
        {/* The persistent background box that stretches dynamically */}
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="clip-cut cut-xs inline-block bg-accent border border-accent/25 shadow-sm p-1.5 max-w-full"
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
  )
}

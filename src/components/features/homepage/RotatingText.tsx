'use client'

import { useState, useEffect, useRef } from 'react'

interface RotatingTextProps {
  texts?: string[]
  initialReasons?: string[] // Backwards compatibility alias
  intervalMs?: number
  label?: string
  className?: string
}

const FALLBACK_REASONS = [
  "Free instant ramen during weekly screenings (if you can beat the president in rock-paper-scissors)",
  "We have a dedicated server to argue about whether subs or dubs are superior",
  "To fulfill your lifelong dream of running like Naruto down the university corridors",
  "Our clubroom has a shrine to the great goddess Haruhi Suzumiya",
  "To find someone who will actually watch all 1000+ episodes of One Piece with you",
  "Because writing CSS is just a visual novel with too many choices",
  "An excuse to play anime openings at maximum volume in the student lounge"
]

export default function RotatingText({
  texts,
  initialReasons,
  intervalMs = 2000,
  label = "Why Join NUSCAS?",
  className = "py-4"
}: RotatingTextProps) {
  const items = texts || initialReasons || FALLBACK_REASONS
  
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const currentIndexRef = useRef(index)
  currentIndexRef.current = index

  useEffect(() => {
    if (items.length <= 1) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      
      setTimeout(() => {
        let nextIndex = currentIndexRef.current
        while (nextIndex === currentIndexRef.current) {
          nextIndex = Math.floor(Math.random() * items.length)
        }
        setIndex(nextIndex)
      }, 300) // Match transition timing

      setTimeout(() => {
        setIsAnimating(false)
      }, 600)

    }, intervalMs)

    return () => clearInterval(interval)
  }, [items, intervalMs])

  return (
    <div className={`w-full h-full flex flex-col justify-stretch animate-fade-in ${className}`}>
      {/* Sleek, professional rotating text container */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface/40 backdrop-blur-md shadow-sm p-6 sm:p-8 text-center flex flex-col justify-between min-h-[200px] h-full transition-all duration-300 hover:shadow-md hover:border-accent/40 group chaos-card-active">
        
        {/* Pulsing indicator badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-muted">
            {label}
          </span>
        </div>

        {/* Dynamic Text Display */}
        <div className="flex-grow flex items-center justify-center px-4 py-2">
          <blockquote 
            className={`text-lg sm:text-xl font-medium font-serif italic text-foreground leading-relaxed transition-all duration-300 ease-in-out ${
              isAnimating 
                ? 'opacity-0 scale-95 translate-y-2 blur-[1px]' 
                : 'opacity-100 scale-100 translate-y-0 blur-0'
            }`}
          >
            &ldquo;{items[index]}&rdquo;
          </blockquote>
        </div>

        {/* Custom progress bar animation */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-border/20 overflow-hidden">
          {items.length > 1 && (
            <div 
              key={index}
              className="h-full bg-gradient-to-r from-accent/40 to-accent"
              style={{ 
                animation: `rotatingTextProgress ${intervalMs}ms linear forwards` 
              }}
            />
          )}
        </div>

        {/* CSS Keyframe definition */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rotatingTextProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}} />
      </div>
    </div>
  )
}

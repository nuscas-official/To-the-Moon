'use client'

import { useState } from 'react'

interface AbsurdReasonsProps {
  initialReasons?: string[]
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

export default function AbsurdReasons({ initialReasons }: AbsurdReasonsProps) {
  const reasons = (initialReasons && initialReasons.length > 0) ? initialReasons : FALLBACK_REASONS
  
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNextReason = () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    // Halfway through the fade-out, switch the text
    setTimeout(() => {
      let nextIndex = index
      // Ensure we get a different reason if there are multiple
      if (reasons.length > 1) {
        while (nextIndex === index) {
          nextIndex = Math.floor(Math.random() * reasons.length)
        }
      } else {
        nextIndex = 0
      }
      setIndex(nextIndex)
    }, 200)

    // Complete the animation cycle
    setTimeout(() => {
      setIsAnimating(false);
    }, 400)
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-12 animate-fade-in">
      <div className="relative overflow-hidden border border-border bg-surface shadow-md p-6 sm:p-8 text-center group chaos-card-active">
        
        <h3 className="text-xs uppercase tracking-widest font-black text-accent mb-3">
          Why Join NUSCAS?
        </h3>
        
        {/* Dynamic Reason Display */}
        <div className="min-h-[100px] flex items-center justify-center px-4">
          <p 
            className={`text-lg sm:text-xl font-extrabold text-foreground transition-all duration-300 ease-in-out ${
              isAnimating 
                ? 'opacity-0 scale-95 -translate-y-2 blur-[2px]' 
                : 'opacity-100 scale-100 translate-y-0 blur-0'
            }`}
          >
            &ldquo;{reasons[index]}&rdquo;
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleNextReason}
            className="group/btn relative px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 active:scale-95 transition-all shadow-sm flex items-center gap-2 border border-neutral-800"
          >
            <span>Convince me</span>
            <svg 
              className={`w-3.5 h-3.5 text-accent group-hover/btn:translate-x-0.5 transition-transform ${isAnimating ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}

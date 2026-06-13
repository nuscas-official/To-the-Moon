'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ChaosContextType {
  chaosMode: boolean;
  triggerChaosClick: () => void;
}

const ChaosContext = createContext<ChaosContextType>({
  chaosMode: false,
  triggerChaosClick: () => {},
})

export function useChaos() {
  return useContext(ChaosContext)
}

export default function ChaosProvider({ children }: { children: React.ReactNode }) {
  const [chaosMode, setChaosMode] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // Cursor tracking states
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [trailPos, setTrailPos] = useState({ x: -100, y: -100 })

  // Initialize chaos mode state on client
  useEffect(() => {
    const stored = localStorage.getItem('chaosMode') === 'true'
    setChaosMode(stored)
    if (stored) {
      document.documentElement.classList.add('chaos-mode')
    }
  }, [])

  // Mouse move listener for custom cursor
  useEffect(() => {
    if (!chaosMode) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [chaosMode])

  // Lag effect for cursor trail
  useEffect(() => {
    if (!chaosMode) return

    let animationFrameId: number

    const updateTrail = () => {
      setTrailPos((prev) => {
        // Linear interpolation to make the trail follow smoothly
        const dx = mousePos.x - prev.x
        const dy = mousePos.y - prev.y
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        }
      })
      animationFrameId = requestAnimationFrame(updateTrail)
    }

    animationFrameId = requestAnimationFrame(updateTrail)
    return () => cancelAnimationFrame(animationFrameId)
  }, [chaosMode, mousePos])

  // Custom click handler for Easter Egg
  const triggerChaosClick = () => {
    const now = Date.now()
    
    // Reset count if delay between clicks is more than 1.5 seconds
    if (now - lastClickTime > 1500) {
      setClickCount(1)
    } else {
      const newCount = clickCount + 1
      setClickCount(newCount)

      if (newCount === 3) {
        // Toggle chaos mode
        const nextState = !chaosMode
        setChaosMode(nextState)
        localStorage.setItem('chaosMode', String(nextState))
        
        if (nextState) {
          document.documentElement.classList.add('chaos-mode')
          showToast('🌀 CHAOS MODE ACTIVATED!')
        } else {
          document.documentElement.classList.remove('chaos-mode')
          showToast('Order restored. Chaos deactivated.')
        }
        
        setClickCount(0)
      }
    }
    
    setLastClickTime(now)
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage((current) => current === message ? null : current)
    }, 3000)
  }

  return (
    <ChaosContext.Provider value={{ chaosMode, triggerChaosClick }}>
      {children}
      
      {/* Custom Neon Trail Cursors */}
      {chaosMode && (
        <>
          <div 
            className="chaos-cursor" 
            style={{ 
              left: 0,
              top: 0,
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` 
            }} 
          />
          <div 
            className="chaos-cursor-trail" 
            style={{ 
              left: 0,
              top: 0,
              transform: `translate3d(${trailPos.x}px, ${trailPos.y}px, 0)` 
            }} 
          />
        </>
      )}

      {/* Slide-in Premium Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-[999999] animate-fade-in">
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl border border-accent bg-neutral-950 text-white font-bold text-sm shadow-xl shadow-accent/20 backdrop-blur">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            <p className="tracking-wide uppercase text-xs">{toastMessage}</p>
          </div>
        </div>
      )}
    </ChaosContext.Provider>
  )
}

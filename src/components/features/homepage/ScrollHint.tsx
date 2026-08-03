'use client'

import { useEffect, useState } from 'react'

// Fixed to the bottom of the viewport; fades out once the visitor starts
// scrolling so it never competes with content further down the page.
export default function ScrollHint({ target = '#events-section' }: { target?: string }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={target}
      onClick={(e) => {
        e.preventDefault()
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }}
      aria-label="Scroll down for more"
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-text-muted hover:text-foreground transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
      <svg
        className="w-4 h-4 animate-bounce"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </a>
  )
}

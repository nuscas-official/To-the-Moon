'use client'

import React, { useEffect } from 'react'

/**
 * The site is single-theme. This provider only runs a one-time cleanup of theme
 * state left over from the previous multi-theme design (stale localStorage keys
 * and document classes), then renders its children untouched.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.removeItem('theme')
    const html = document.documentElement
    for (const cls of ['theme-winter', 'theme-spring', 'theme-summer', 'theme-autumn', 'theme-lumine', 'theme-aether']) {
      html.classList.remove(cls)
    }
  }, [])

  return <>{children}</>
}

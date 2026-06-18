'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type ThemeType = 'default'

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('default')

  // Initialize theme from localStorage on mount
  useEffect(() => {
    // Clean up any old theme storage and document classes on mount since we are single-theme now
    localStorage.removeItem('theme')
    const html = document.documentElement
    html.classList.remove('theme-winter')
    html.classList.remove('theme-spring')
    html.classList.remove('theme-summer')
    html.classList.remove('theme-autumn')
    html.classList.remove('theme-lumine')
    html.classList.remove('theme-aether')
  }, [])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

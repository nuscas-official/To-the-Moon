'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type ThemeType = 'default' | 'spring' | 'summer' | 'autumn' | 'winter' | 'lumine' | 'aether'

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

const THEME_CLASSES: Record<ThemeType, string> = {
  default: '',
  spring: 'theme-spring',
  summer: 'theme-summer',
  autumn: 'theme-autumn',
  winter: 'theme-winter',
  lumine: 'theme-lumine',
  aether: 'theme-aether',
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('default')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeType
    if (storedTheme && Object.keys(THEME_CLASSES).includes(storedTheme)) {
      setThemeState(storedTheme)
      const html = document.documentElement
      // Remove all theme classes first
      Object.values(THEME_CLASSES).forEach((cls) => {
        if (cls) html.classList.remove(cls)
      })
      // Add stored theme class
      const cls = THEME_CLASSES[storedTheme]
      if (cls) html.classList.add(cls)
    }
    setMounted(true)
  }, [])

  const setTheme = (newTheme: ThemeType) => {
    if (!mounted) return

    const html = document.documentElement
    
    // Add transition styling helper class
    html.classList.add('theme-transitioning')

    // Remove all existing theme classes
    Object.values(THEME_CLASSES).forEach((cls) => {
      if (cls) html.classList.remove(cls)
    })

    // Add new theme class
    const newCls = THEME_CLASSES[newTheme]
    if (newCls) html.classList.add(newCls)

    // Update state and localStorage
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)

    // Remove transition class after the transition finishes (1800ms duration + some buffer)
    const timer = setTimeout(() => {
      html.classList.remove('theme-transitioning')
    }, 2000)

    return () => clearTimeout(timer)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

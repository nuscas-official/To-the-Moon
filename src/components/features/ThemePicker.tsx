'use client'

import React from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { motion } from 'framer-motion'

interface ThemeOption {
  id: 'default' | 'spring' | 'summer' | 'autumn' | 'winter' | 'lumine' | 'aether'
  name: string
  bg: string
  accent: string
  text: string
  border: string
  tag: string
}

const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Sandrone Crimson',
    bg: '#fcfbf9',
    accent: '#a81c24',
    text: '#1a1616',
    border: '#e6dfdf',
    tag: 'Crimson & Ivory',
  },
  {
    id: 'spring',
    name: 'Sakura Spring',
    bg: '#fbf0f5',
    accent: '#ff4191',
    text: '#3a2e32',
    border: '#f8d3e6',
    tag: 'Warm Cherry',
  },
  {
    id: 'summer',
    name: 'Emerald Summer',
    bg: '#f0faf0',
    accent: '#4d9e3a',
    text: '#1a2e1a',
    border: '#c0e0b8',
    tag: 'Minty Leaf',
  },
  {
    id: 'autumn',
    name: 'Maple Autumn',
    bg: '#181716',
    accent: '#d13e2e',
    text: '#eceae6',
    border: '#353230',
    tag: 'Cozy Dark',
  },
  {
    id: 'winter',
    name: 'Starlight Winter',
    bg: '#07111e',
    accent: '#5abce8',
    text: '#c8e0f0',
    border: '#1e3550',
    tag: 'Frosted Night',
  },
  {
    id: 'lumine',
    name: 'Lumine Blue',
    bg: '#f4f7fc',
    accent: '#38bdf8',
    text: '#1e293b',
    border: '#e2ebf8',
    tag: 'Sky Starlight',
  },
  {
    id: 'aether',
    name: 'Aether Gold',
    bg: '#0a0d1a',
    accent: '#e5c37b',
    text: '#f8fafc',
    border: '#1e253d',
    tag: 'Cosmic Abyssal',
  },
]

export default function ThemePicker() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4 px-2 py-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Seasonal Styling
        </h3>
        <p className="text-[11px] text-text-muted">
          Transform the interface with custom seasonal & starlight palettes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {THEMES.map((opt) => {
          const isActive = theme === opt.id

          return (
            <motion.button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-300 focus:outline-none group`}
              style={{
                backgroundColor: opt.bg,
                borderColor: isActive ? 'var(--color-accent)' : opt.border,
                boxShadow: isActive ? '0 0 12px var(--color-accent-muted)' : 'none',
              }}
            >
              {/* Color Swatch Circle */}
              <div 
                className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border transition-transform duration-300 group-hover:scale-110"
                style={{ borderColor: opt.border, backgroundColor: opt.bg }}
              >
                {/* Text color diagonal bar */}
                <div 
                  className="absolute inset-0 rotate-45 transform translate-y-3"
                  style={{ backgroundColor: opt.text }}
                />
                {/* Accent color center dot */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: opt.accent }}
                />
              </div>

              {/* Name and Tagline */}
              <div className="min-w-0 flex-grow">
                <p 
                  className="text-xs font-bold truncate transition-colors"
                  style={{ color: opt.text }}
                >
                  {opt.name}
                </p>
                <p 
                  className="text-[9px] font-medium truncate opacity-70"
                  style={{ color: opt.text }}
                >
                  {opt.tag}
                </p>
              </div>

              {/* Active Selection Indicator */}
              {isActive && (
                <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

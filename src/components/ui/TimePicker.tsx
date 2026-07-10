'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

interface TimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  relativeTo?: Date | null // If provided, options show duration from this start time
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

interface TimeOption {
  label: string
  hours: number
  minutes: number
  dayOffset: number
}

// Format 24h hours/minutes to 12h AM/PM format (e.g. "2:30 PM")
function formatTime12h(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  const displayMinutes = String(minutes).padStart(2, '0')
  return `${displayHours}:${displayMinutes} ${ampm}`
}

// Parse user typed time string into hours and minutes
function parseTime(inputStr: string): { hours: number; minutes: number } | null {
  // Normalize a.m. / p.m. / am / pm / a / p formats
  const clean = inputStr
    .trim()
    .toLowerCase()
    .replace(/a\.m\./g, 'am')
    .replace(/p\.m\./g, 'pm')
    .replace(/a\.m/g, 'am')
    .replace(/p\.m/g, 'pm')
    .replace(/\./g, ':')
  if (!clean) return null

  // 1. Matches "9am", "9:30am", "9 30 pm", "9a", "9:30p", etc.
  const ampmMatch = clean.match(/^(\d{1,2})(?::| )?(\d{2})?\s*(am|pm|a|p)$/)
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10)
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0
    const indicator = ampmMatch[3]

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null

    if (indicator.startsWith('p') && hours < 12) {
      hours += 12
    } else if (indicator.startsWith('a') && hours === 12) {
      hours = 0
    }
    return { hours, minutes }
  }

  // 2. Matches "13:30", "09:15", "9:00"
  const colonMatch = clean.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10)
    const minutes = parseInt(colonMatch[2], 10)
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes }
    }
  }

  // 3. Matches pure numbers like "9", "930", "1330"
  const numMatch = clean.match(/^(\d{1,4})$/)
  if (numMatch) {
    const val = numMatch[1]
    if (val.length <= 2) {
      // "9", "13", "2"
      const hours = parseInt(val, 10)
      if (hours >= 0 && hours < 24) {
        return { hours, minutes: 0 }
      }
    } else {
      // "930" -> hours 9, minutes 30; "1330" -> hours 13, minutes 30
      const hours = parseInt(val.slice(0, val.length - 2), 10)
      const minutes = parseInt(val.slice(val.length - 2), 10)
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return { hours, minutes }
      }
    }
  }

  return null
}

export default function TimePicker({
  value,
  onChange,
  relativeTo = null,
  placeholder = 'Select time',
  required = false,
  disabled = false,
  className = '',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [typedText, setTypedText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Generate options based on relativeTo or standard day
  const options = useMemo<TimeOption[]>(() => {
    const opts: TimeOption[] = []
    if (relativeTo) {
      // Generate 96 options (24 hours) in 15 minute steps starting after relativeTo
      const start = new Date(relativeTo)
      for (let i = 1; i <= 96; i++) {
        const optionTime = new Date(start.getTime() + i * 15 * 60 * 1000)
        const diffMinutes = i * 15

        let durationLabel = ''
        if (diffMinutes < 60) {
          durationLabel = `(+${diffMinutes} min)`
        } else {
          const hrs = Math.floor(diffMinutes / 60)
          const mins = diffMinutes % 60
          if (mins === 0) {
            durationLabel = `(+${hrs} ${hrs === 1 ? 'hr' : 'hrs'})`
          } else {
            durationLabel = `(+${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins} m)`
          }
        }

        const formatted = formatTime12h(optionTime.getHours(), optionTime.getMinutes())
        opts.push({
          label: `${formatted} ${durationLabel}`,
          hours: optionTime.getHours(),
          minutes: optionTime.getMinutes(),
          dayOffset: Math.floor((start.getHours() * 60 + start.getMinutes() + diffMinutes) / (24 * 60)),
        })
      }
    } else {
      // Generate standard 24 hours of 15 min intervals
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
          opts.push({
            label: formatTime12h(h, m),
            hours: h,
            minutes: m,
            dayOffset: 0,
          })
        }
      }
    }
    return opts
  }, [relativeTo])

  // Calculate focused index based on typing or current value (non-filtering)
  const focusedIndex = useMemo(() => {
    const normalizedTyped = typedText.toLowerCase().replace(/[\s:]/g, '')
    if (!normalizedTyped) {
      if (value) {
        return options.findIndex(
          (opt) => opt.hours === value.getHours() && opt.minutes === value.getMinutes()
        )
      }
      return -1
    }
    return options.findIndex((opt) => {
      const normalizedOpt = opt.label.toLowerCase().replace(/[\s:]/g, '')
      return normalizedOpt.includes(normalizedTyped)
    })
  }, [typedText, value, options])

  const handleBlur = useCallback(() => {
    const trimmed = typedText.trim()
    if (!trimmed) {
      if (required && value) {
        // Reset to original value if required
        setTypedText(formatTime12h(value.getHours(), value.getMinutes()))
      } else {
        onChange(null)
      }
      return
    }

    // Support typing shortcut: if they just type "am"/"pm"/"a"/"p", toggle meridiem on existing value
    const clean = trimmed.toLowerCase()
    if (value && (clean === 'am' || clean === 'pm' || clean === 'a' || clean === 'p')) {
      const isPM = clean.startsWith('p')
      let hours = value.getHours()
      if (isPM && hours < 12) {
        hours += 12
      } else if (!isPM && hours >= 12) {
        hours -= 12
      }
      const next = new Date(value)
      next.setHours(hours)
      onChange(next)
      return
    }

    const parsed = parseTime(trimmed)
    if (parsed) {
      let baseDate = value ? new Date(value) : (relativeTo ? new Date(relativeTo) : new Date())
      
      if (relativeTo) {
        // Smart next-day calculation when typing end time:
        // if typed time is before start time, assume next day.
        baseDate = new Date(relativeTo)
        const checkDate = new Date(relativeTo)
        checkDate.setHours(parsed.hours)
        checkDate.setMinutes(parsed.minutes)
        checkDate.setSeconds(0)
        checkDate.setMilliseconds(0)

        if (checkDate.getTime() <= relativeTo.getTime()) {
          baseDate.setDate(baseDate.getDate() + 1)
        }
      }

      baseDate.setHours(parsed.hours)
      baseDate.setMinutes(parsed.minutes)
      baseDate.setSeconds(0)
      baseDate.setMilliseconds(0)

      onChange(baseDate)
    } else if (value) {
      // Revert if invalid
      setTypedText(formatTime12h(value.getHours(), value.getMinutes()))
    } else {
      setTypedText('')
    }
  }, [typedText, required, value, onChange, relativeTo])

  const handleSelectOption = (opt: TimeOption) => {
    let baseDate = value ? new Date(value) : (relativeTo ? new Date(relativeTo) : new Date())
    
    if (relativeTo) {
      // Always start from relativeTo date for endsAt time to calculate day crossings
      baseDate = new Date(relativeTo)
      baseDate.setDate(baseDate.getDate() + opt.dayOffset)
    }

    baseDate.setHours(opt.hours)
    baseDate.setMinutes(opt.minutes)
    baseDate.setSeconds(0)
    baseDate.setMilliseconds(0)

    onChange(baseDate)
    setIsOpen(false)
  }

  // Format external value changes into the input text
  useEffect(() => {
    if (value) {
      setTypedText(formatTime12h(value.getHours(), value.getMinutes()))
    } else {
      setTypedText('')
    }
  }, [value])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        handleBlur()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleBlur])

  // Scroll dropdown to focused/selected time
  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex !== -1) {
      const container = listRef.current
      const element = container.children[focusedIndex] as HTMLElement
      if (element) {
        const containerHeight = container.clientHeight || 240
        const elementHeight = element.offsetHeight || 32
        const elementOffsetTop = element.offsetTop
        container.scrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2)
      }
    }
  }, [isOpen, focusedIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Select the currently focused/matched option if dropdown is open.
      if (isOpen && focusedIndex !== -1) {
        handleSelectOption(options[focusedIndex])
      } else {
        handleBlur()
      }
      setIsOpen(false)
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      handleBlur()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Input Group */}
      <div
        className={`flex items-center space-x-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {/* Clock Icon */}
        <svg
          className="w-4 h-4 text-neutral-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <input
          type="text"
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent outline-none p-0 border-none text-neutral-800 placeholder-neutral-400 text-sm"
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Time Options Dropdown */}
      {isOpen && options.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 z-[999] mt-2 max-h-60 overflow-y-auto bg-surface border border-border rounded-xl shadow-xl py-1.5 animate-fade-in text-left"
        >
          {options.map((opt, idx) => {
            const isFocused = idx === focusedIndex
            const isSelected = value && value.getHours() === opt.hours && value.getMinutes() === opt.minutes
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-bold hover:bg-accent-hover'
                    : isFocused
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

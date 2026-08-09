'use client'

import { useState, useEffect, useRef } from 'react'

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return value ? new Date(value.getFullYear(), value.getMonth(), 1, 12, 0, 0) : new Date()
  })
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync currentMonth display when value changes externally
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value.getFullYear(), value.getMonth(), 1, 12, 0, 0))
    }
  }, [value])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Format date to a readable string (e.g. "Jul 10, 2026")
  const formattedValue = value
    ? value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1, 12, 0, 0))
  }

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1, 12, 0, 0))
  }

  // Generate calendar days
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0)
  const startDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const totalDays = new Date(year, month + 1, 0, 12, 0, 0).getDate()
  const prevTotalDays = new Date(year, month, 0, 12, 0, 0).getDate()

  const cells: { date: Date; isCurrentMonth: boolean }[] = []

  // Prev month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevTotalDays - i, 12, 0, 0),
      isCurrentMonth: false,
    })
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      date: new Date(year, month, i, 12, 0, 0),
      isCurrentMonth: true,
    })
  }

  // Next month padding to complete 42 cells (6 weeks grid)
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      date: new Date(year, month + 1, i, 12, 0, 0),
      isCurrentMonth: false,
    })
  }

  // Helper to check if two dates are same calendar day
  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(today, date)
  }

  const handleSelectDay = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onChange(date)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onChange(null)
  }

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Input container */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral-800 focus-within:border-accent focus-within:ring-1 focus-within:ring-inset focus-within:ring-accent transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2 w-full overflow-hidden">
          {/* Calendar Icon */}
          <svg
            className="w-4 h-4 text-neutral-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={`truncate ${!formattedValue ? 'text-neutral-400' : 'text-neutral-800'}`}>
            {formattedValue || placeholder}
          </span>
        </div>

        {/* Clear Button if optional and valued */}
        {value && !required && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-neutral-400 hover:text-neutral-600 focus:outline-none ml-2"
            aria-label="Clear date"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 md:right-auto md:w-[290px] z-[999] mt-2 p-3 bg-surface border border-border rounded-xl shadow-xl animate-fade-in text-left">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-black text-neutral-800">{monthLabel}</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-full text-neutral-600 hover:bg-surface-hover hover:text-neutral-900 transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-full text-neutral-600 hover:bg-surface-hover hover:text-neutral-900 transition-colors"
                aria-label="Next month"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayNames.map((day, idx) => (
              <span key={idx} className="text-[10px] font-black tracking-wider text-neutral-400 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const selected = isSameDay(value, cell.date)
              const current = cell.isCurrentMonth
              const today = isToday(cell.date)

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectDay(cell.date, e)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto transition-all relative ${
                    selected
                      ? 'bg-accent text-accent-foreground font-bold'
                      : today
                      ? 'border border-accent text-accent font-bold hover:bg-surface-hover'
                      : current
                      ? 'text-neutral-800 hover:bg-surface-hover'
                      : 'text-neutral-300 hover:bg-surface-hover'
                  }`}
                >
                  {cell.date.getDate()}
                  {/* Optional indicator for today inside selected */}
                  {today && selected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

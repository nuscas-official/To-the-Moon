'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { type User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import AuthButton from '@/components/features/auth/AuthButton'
import { HybridText } from '@/components/HybridText'
import { NavLabel } from './NavLabel'

interface HeaderProps {
  user: User | null
  showAdminLink: boolean
  isEventModalOpen?: boolean
}

// Framer Motion Animation Variants
const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    }
  }
}

const menuItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 24
    }
  }
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Ratings', href: '/ratings' },
  { label: 'VNs', href: '/vn' },
];

export function HeaderContent({ user, showAdminLink, isEventModalOpen = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [isOverDark, setIsOverDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect if header is scrolled over a dark section and check if scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      const darkSections = document.querySelectorAll('.bg-background-dark, .theme-crimson')
      let overDark = false
      
      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        // Check if the sticky header (top 80px) overlaps the dark section
        if (rect.top <= 80 && rect.bottom >= 0) {
          overDark = true
        }
      })
      
      setIsOverDark(overDark)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [pathname])

  // Close sidebar on path change or when event modal opens
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, isEventModalOpen])

  // Escape key handler to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Scroll lock when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Top Sticky Header Bar */}
      <header className={`sticky top-0 z-[60] w-full transition-all duration-300 bg-transparent shadow-none ${
        isScrolled 
          ? 'md:bg-surface md:shadow-sm md:opacity-75' 
          : 'md:bg-surface'
      } ${isEventModalOpen ? 'hidden' : ''}`}>
        <div className="max-w-8xl mx-auto flex h-16 items-center justify-between px-6 relative">
          {/* Logo & Menu Title on Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/nuscas_logo.webp"
                alt="NUSCAS Logo"
                className={`w-auto object-contain transition-all duration-350 ease-in-out ${
                  isScrolled 
                    ? 'h-7'
                    : 'h-10'
                }`}
              />
            </Link>
          </div>

          {/* Desktop Horizontal Navigation Bar */}
          <nav className={`hidden md:flex items-center gap-8 transition-all duration-300 ${
            isOpen
              ? 'opacity-0 -translate-y-2 pointer-events-none'
              : 'opacity-100 translate-y-0 pointer-events-auto'
          }`}>
            <div className="flex items-center gap-8">
              {/* Main Loop Links */}
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative py-2 text-sm font-medium tracking-wide transition-colors duration-250 ${
                      isActive ? 'text-accent font-semibold' : 'text-text hover:text-accent'
                    }`}
                  >
                    <NavLabel label={item.label} isActive={isActive} />
                  </Link>
                )
              })}

              {/* Member Link */}
              {user && (
                <Link
                  href="/member/articles"
                  className={`group relative py-2 text-sm font-medium tracking-wide transition-colors duration-250 ${
                    pathname.startsWith('/member') ? 'text-accent font-semibold' : 'text-text hover:text-accent'
                  }`}
                >
                  <NavLabel label="Member" isActive={pathname.startsWith('/member')} />
                </Link>
              )}

              {/* Admin Link */}
              {showAdminLink && (
                <Link
                  href="/admin/posts"
                  className={`group relative py-2 text-sm font-medium tracking-wide transition-colors duration-250 ${
                    pathname.startsWith('/admin') ? 'text-accent font-semibold' : 'text-text hover:text-accent'
                  }`}
                >
                  <NavLabel label="Admin" isActive={pathname.startsWith('/admin')} />
                </Link>
              )}
            </div>

            {/* Divider */}
            <div className="h-4 w-[1px] borderbg-" />

            {/* Auth Button */}
            <div className="flex items-center">
              <AuthButton user={user} />
            </div>
          </nav>

          {/* Unified Hamburger / Close Menu Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center w-16 h-16 rounded-full overflow-hidden group focus:outline-none transition-all duration-300 z-[60] absolute right-6 top-1/2 -translate-y-1/2 md:right-8 md:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="sidebar-navigation"
          >
            {/* Hover Circle Effect */}
            <span className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" />

            {/* Hamburger Icon (Image) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hamburger_lines.webp"
              alt="Open Menu"
              className={`h-12 w-12 object-contain z-10 transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${isOpen ? 'opacity-0 rotate-180 scale-50 pointer-events-none' : 'opacity-100 rotate-0 scale-100 group-hover:scale-90'
                } ${isOverDark && !isOpen ? 'invert' : ''}`}
            />

            {/* Close Icon (SVG) */}
            <svg
              className={`h-8 w-8 transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 ${isOpen ? 'opacity-100 rotate-0 scale-100 text-text' : 'opacity-0 -rotate-180 scale-50 pointer-events-none'
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop Overlay & Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 bg-black/60 cursor-pointer"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Sidebar Navigation Drawer */}
            <motion.div
              id="sidebar-navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 z-50 h-full w-[240px] md:w-[300px] max-w-full bg-surface shadow-2xl flex flex-col pt-20"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Menu"
            >
              <HybridText
                text="The Menu"
                revealType="stagger"
                className="absolute top-10 left-6 font-mono text-md font-bold tracking-widest text-text-muted select-none"
              />

              {/* Drawer Content Area */}
              <div className="flex-grow overflow-y-auto px-6 pb-8 pt-2 flex flex-col justify-between">
                <motion.div
                  variants={menuContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {/* Primary Navigation Links */}
                  <div>
                    <motion.p
                      variants={menuItemVariants}
                      className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 pr-2"
                    >
                      Explore
                    </motion.p>
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <motion.div key={item.href} variants={menuItemVariants}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 py-3 px-3.5 rounded-xl hover:text-accent hover:bg-accent-muted/50 transition-all duration-300 font-medium tracking-wide text-[15px] group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform duration-300" />
                            <span className="transition-transform duration-250 group-hover:translate-x-1">
                              {item.label}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Member and Admin Navigation Links */}
                  {(user || showAdminLink) && (
                    <div>
                      <motion.p
                        variants={menuItemVariants}
                        className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2"
                      >
                        Member&apos;s Portal
                      </motion.p>
                      <nav className="space-y-1">
                        {user && (
                          <motion.div variants={menuItemVariants}>
                            <Link
                              href="/member/articles"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 py-3 px-3.5 rounded-xl text-text hover:text-accent hover:bg-accent-muted/50 border border-transparent hover:border-accent/15 transition-all duration-250 font-medium tracking-wide text-[15px] group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform duration-250" />
                              <span className="transition-transform duration-250 group-hover:translate-x-1">
                                Member
                              </span>
                            </Link>
                          </motion.div>
                        )}
                        {showAdminLink && (
                          <motion.div variants={menuItemVariants}>
                            <Link
                              href="/admin/posts"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 py-3 px-3.5 rounded-xl text-text hover:text-accent hover:bg-accent-muted/50 border border-transparent hover:border-accent/15 transition-all duration-250 font-medium tracking-wide text-[15px] group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-accent scale-0 group-hover:scale-100 transition-transform duration-250" />
                              <span className="transition-transform duration-250 group-hover:translate-x-1">
                                Admin
                              </span>
                            </Link>
                          </motion.div>
                        )}
                      </nav>
                    </div>
                  )}


                </motion.div>

                {/* Auth Section at the bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="pt-8 border-t border-border mt-8"
                >
                  <div className="flex flex-col gap-3">
                    {user && (
                      <div className="px-2 mb-2">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-medium text-text truncate max-w-full" title={user.email}>
                          {user.email}
                        </p>
                      </div>
                    )}
                    <AuthButton user={user} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function HeaderWithSearchParams({ user, showAdminLink }: HeaderProps) {
  const searchParams = useSearchParams()
  const isEventModalOpen = !!searchParams.get('event')
  return (
    <HeaderContent
      user={user}
      showAdminLink={showAdminLink}
      isEventModalOpen={isEventModalOpen}
    />
  )
}

export default function Header(props: Omit<HeaderProps, 'isEventModalOpen'>) {
  return (
    <Suspense fallback={<HeaderContent {...props} isEventModalOpen={false} />}>
      <HeaderWithSearchParams {...props} />
    </Suspense>
  )
}

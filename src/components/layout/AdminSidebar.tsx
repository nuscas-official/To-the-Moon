'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  userDisplayName: string
  userRole: string
}

export default function AdminSidebar({ userDisplayName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ), roles: ['admin', 'committee'] },
    { href: '/admin/posts', label: 'Posts', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ), roles: ['admin', 'committee'] },
    { href: '/admin/events', label: 'Events', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), roles: ['admin', 'committee'] },
    { href: '/admin/gallery', label: 'Gallery', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), roles: ['admin', 'committee'] },
    { href: '/admin/members', label: 'Members', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), roles: ['admin'] },
    { href: '/admin/members/invites', label: 'Invites', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ), roles: ['admin'], isSubItem: true },
    { href: '/admin/settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), roles: ['admin', 'committee'] },
  ]

  // Filter links by role permissions
  const visibleLinks = links.filter(link => link.roles.includes(userRole))

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {visibleLinks.map((link) => {
        const isExactActive = pathname === link.href
        const isParentActive = !link.isSubItem && link.href !== '/admin/dashboard' && pathname.startsWith(link.href)
        const isActive = isExactActive || isParentActive

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 transition-all text-sm ${
              link.isSubItem
                ? `ml-6 pl-4 border-l-2 py-2 ${
                    isExactActive
                      ? 'border-accent text-accent font-black'
                      : 'border-border text-text-muted hover:text-neutral-900 hover:border-neutral-400 font-bold'
                  }`
                : `px-4 py-2.5 rounded-xl font-bold ${
                    isActive
                      ? isParentActive
                        ? 'bg-neutral-100 text-neutral-900 font-black dark:bg-neutral-800 dark:text-white shadow-sm'
                        : 'bg-neutral-900 text-white font-black shadow-sm'
                      : 'text-text-muted hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`
            }`}
          >
            <span className={isActive ? 'text-accent' : 'text-neutral-400'}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile Top Bar (toggleable) */}
      <div className="flex md:hidden items-center justify-between border border-border bg-surface px-4 py-3 rounded-xl mb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-800">Admin Control</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-border text-neutral-600 hover:bg-neutral-50 active:scale-95 transition-all"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu (animated) */}
      {isOpen && (
        <div className="md:hidden border border-border bg-surface rounded-xl p-4 mb-6 shadow-md animate-fade-in flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/80">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-black text-neutral-900">{userDisplayName}</div>
              <div className="inline-flex items-center rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent uppercase mt-0.5">
                {userRole}
              </div>
            </div>
          </div>
          {renderNavLinks()}
        </div>
      )}

      {/* Desktop Sidebar (persistent) */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-border/80 pr-6 text-left self-stretch justify-between">
        <div className="space-y-6">
          {/* Header metadata */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-lg shadow-sm shadow-accent/20">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black text-neutral-900 truncate" title={userDisplayName}>
                {userDisplayName}
              </div>
              <div className="mt-0.5">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-[9px] font-black text-accent uppercase tracking-wider border border-accent/20">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Links list */}
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 px-3 mb-2">Navigation</div>
            {renderNavLinks()}
          </div>
        </div>

        {/* Footer/Help links */}
        <div className="pt-6 border-t border-border/60">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-muted hover:text-neutral-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Homepage</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavTabsProps {
  userDisplayName: string
  userRole: string
}

export default function AdminNavTabs({ userDisplayName, userRole }: AdminNavTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { href: '/admin/dashboard', label: 'Dashboard', roles: ['admin', 'committee'] },
    { href: '/admin/posts', label: 'Manage Posts', roles: ['admin', 'committee'] },
    { href: '/admin/events', label: 'Manage Events', roles: ['admin', 'committee'] },
    { href: '/admin/gallery', label: 'Manage Gallery', roles: ['admin', 'committee'] },
    { href: '/admin/members', label: 'Manage Members', roles: ['admin'] },
    { href: '/admin/members/invites', label: 'Manage Invites', roles: ['admin'] },
    { href: '/admin/settings', label: 'Settings', roles: ['admin', 'committee'] },
  ]

  const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole))

  return (
    <div className="w-full border-b border-border pb-1 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-accent text-white flex items-center justify-center font-black text-sm shadow-sm">
            {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="text-sm font-black text-neutral-900 leading-none">
              {userDisplayName}
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center rounded-none bg-accent/10 px-1.5 py-0.5 text-[9px] font-black text-accent uppercase tracking-wider border border-accent/20">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-neutral-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none pt-2">
        {visibleTabs.map((tab) => {
          let isActive = false
          if (tab.href === '/admin/dashboard') {
            isActive = pathname === '/admin/dashboard' || pathname === '/admin'
          } else if (tab.href === '/admin/members') {
            isActive = pathname === '/admin/members'
          } else if (tab.href === '/admin/members/invites') {
            isActive = pathname.startsWith('/admin/members/invites')
          } else {
            isActive = pathname.startsWith(tab.href)
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all rounded-none ${
                isActive
                  ? 'border-accent text-accent bg-accent/[0.04]'
                  : 'border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

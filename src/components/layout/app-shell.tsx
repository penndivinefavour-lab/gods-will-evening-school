'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BRANDING_DEFAULTS } from '@/config/branding'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/students', label: 'Students', icon: '🎓' },
  { href: '/dashboard/guardians', label: 'Guardians', icon: '👨‍👩‍👧' },
  { href: '/dashboard/teachers', label: 'Teachers', icon: '🧑‍🏫' },
  { href: '/dashboard/classes', label: 'Classes', icon: '🏫' },
  { href: '/dashboard/subjects', label: 'Subjects', icon: '📚' },
  { href: '/dashboard/teacher-assignments', label: 'Teacher Assignments', icon: '📋' },
  { href: '/dashboard/enrollments', label: 'Enrollments', icon: '📝' },
  { href: '/dashboard/fee-structures', label: 'Fee Structures', icon: '💰' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { href: '/dashboard/receipts', label: 'Receipts', icon: '🧾' },
  { href: '/dashboard/attendance', label: 'Attendance', icon: '📅' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: BRANDING_DEFAULTS.colors.background, fontFamily: BRANDING_DEFAULTS.typography.fontFamily }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{BRANDING_DEFAULTS.shortName}</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="mt-2 flex-1 space-y-1 px-2" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-white/20 p-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header
          className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.background }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 -ml-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
            {BRANDING_DEFAULTS.shortName}
          </span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

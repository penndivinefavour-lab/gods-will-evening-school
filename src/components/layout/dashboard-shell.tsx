'use client'

import { type ReactNode } from 'react'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: BRANDING_DEFAULTS.colors.background,
      color: BRANDING_DEFAULTS.colors.text,
      fontFamily: BRANDING_DEFAULTS.typography.fontFamily,
    }}>
      <header style={{
        backgroundColor: BRANDING_DEFAULTS.colors.primary,
        color: '#ffffff',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 700 }}>{BRANDING_DEFAULTS.shortName} Platform</div>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
          <a href="/dashboard" style={{ color: '#ffffff' }}>Dashboard</a>
          <a href="/login" style={{ color: '#ffffff' }}>Sign out</a>
        </nav>
      </header>
      <main style={{ padding: '1.25rem' }}>
        {children}
      </main>
    </div>
  )
}

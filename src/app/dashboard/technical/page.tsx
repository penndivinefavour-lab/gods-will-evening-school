 
'use client'

import DashboardShell from '@/components/layout/dashboard-shell'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function TechnicalDashboardPage() {
  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: BRANDING_DEFAULTS.colors.primary }}>
            Technical Administrator Dashboard
          </h1>
          <p style={{ color: BRANDING_DEFAULTS.colors.muted }}>
            Platform overview, school management, users, roles and configuration.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { title: 'Schools', description: 'Manage tenant schools' },
            { title: 'Users', description: 'Platform user management' },
            { title: 'Roles', description: 'Role and permission management' },
            { title: 'Billing', description: 'Subscriptions and invoices' },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                backgroundColor: BRANDING_DEFAULTS.colors.surface,
              }}
            >
              <div style={{ fontWeight: 600 }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: BRANDING_DEFAULTS.colors.muted }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          backgroundColor: BRANDING_DEFAULTS.colors.surface,
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Platform Status</div>
          <div style={{ color: BRANDING_DEFAULTS.colors.muted, fontSize: '0.9rem' }}>
            Foundation status: incomplete until Supabase project and seed data are applied.
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

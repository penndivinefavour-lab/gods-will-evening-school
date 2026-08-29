/* eslint-disable @typescript-eslint/no-explicit-any */
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import ErrorState from '@/components/ui/error-state'
import { getClass } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

function formatField(value: string | null | undefined) {
  if (!value) return '—'
  return value
}

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let cls: Awaited<ReturnType<typeof getClass>> | null = null
  let error: string | null = null

  try {
    const result = await getClass(id)
    cls = result as any
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load class'
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (!cls) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Class not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  const c = cls as any

  const statusStyle: Record<string, { bg: string; text: string }> = {
    active: { bg: '#dcfce7', text: '#166534' },
    inactive: { bg: '#f1f5f9', text: '#475569' },
  }
  const status = statusStyle[c.status?.toLowerCase()] || { bg: '#f1f5f9', text: '#475569' }

  const sections = [
    {
      title: 'Class Information',
      fields: [
        { label: 'Name', value: c.name },
        { label: 'Display Name', value: formatField(c.display_name) },
        { label: 'Stream', value: formatField(c.stream) },
        { label: 'Capacity', value: c.capacity ?? '—' },
        { label: 'Status', value: <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={{ backgroundColor: status.bg, color: status.text }}>{c.status}</span> },
        { label: 'Academic Year ID', value: formatField(c.academic_year_id) },
      ],
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={c.display_name || c.name}
          description="Class record"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/dashboard/classes' },
            { label: c.display_name || c.name },
          ]}
          actions={
            <Link
              href={`/dashboard/classes/${c.class_id}/edit`}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Edit
            </Link>
          }
        />

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title} className="rounded-lg border p-5" style={{ borderColor: '#e2e8f0' }}>
              <h3 className="mb-4 text-base font-semibold" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
                {section.title}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <div className="text-xs font-medium uppercase tracking-wider" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
                      {field.label}
                    </div>
                    <div className="mt-1 text-sm" style={{ color: BRANDING_DEFAULTS.colors.text }}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

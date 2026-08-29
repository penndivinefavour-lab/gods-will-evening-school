/* eslint-disable @typescript-eslint/no-explicit-any */
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import ErrorState from '@/components/ui/error-state'
import { getSubject } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

function formatField(value: string | null | undefined) {
  if (!value) return '—'
  return value
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let subject: Awaited<ReturnType<typeof getSubject>> | null = null
  let error: string | null = null

  try {
    const result = await getSubject(id)
    subject = result as any
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load subject'
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (!subject) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Subject not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  const s = subject as any

  const sections = [
    {
      title: 'Subject Information',
      fields: [
        { label: 'Name', value: s.name },
        { label: 'Code', value: formatField(s.code) },
        { label: 'Description', value: formatField(s.description) },
        { label: 'Active', value: s.active ? 'Yes' : 'No' },
      ],
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={s.name}
          description={`Subject · ${s.code || 'No code'}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Subjects', href: '/dashboard/subjects' },
            { label: s.name },
          ]}
          actions={
            <Link
              href={`/dashboard/subjects/${s.subject_id}/edit`}
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

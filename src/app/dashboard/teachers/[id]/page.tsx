/* eslint-disable @typescript-eslint/no-explicit-any */
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import ErrorState from '@/components/ui/error-state'
import { getTeacher } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

function formatField(value: string | null | undefined) {
  if (!value) return '—'
  return value
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let teacher: Awaited<ReturnType<typeof getTeacher>> | null = null
  let error: string | null = null

  try {
    const result = await getTeacher(id)
    teacher = result as any
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load teacher'
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (!teacher) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Teacher not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  const t = teacher as any

  const employmentStyle: Record<string, { bg: string; text: string }> = {
    full_time: { bg: '#e0e7ff', text: '#3730a3' },
    part_time: { bg: '#fce7f3', text: '#9d174d' },
    contract: { bg: '#ccfbf1', text: '#115e59' },
  }
  const emp = employmentStyle[t.employment_status?.toLowerCase()] || { bg: '#f1f5f9', text: '#475569' }

  const sections = [
    {
      title: 'Employment Information',
      fields: [
        { label: 'Staff ID', value: t.staff_id },
        { label: 'Employment Status', value: <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={{ backgroundColor: emp.bg, color: emp.text }}>{t.employment_status?.replace('_', ' ')}</span> },
        { label: 'Date Joined', value: formatDate(t.date_joined) },
      ],
    },
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: `${t.first_name} ${t.last_name}`.trim() },
        { label: 'Qualifications', value: formatField(t.qualifications) },
        { label: 'Specialization', value: formatField(t.specialization) },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { label: 'Phone', value: formatField(t.phone) },
        { label: 'Email', value: formatField(t.email) },
        { label: 'Emergency Contact', value: formatField(t.emergency_contact) },
      ],
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`${t.first_name} ${t.last_name}`}
          description={`Teacher record · ${t.staff_id}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Teachers', href: '/dashboard/teachers' },
            { label: `${t.first_name} ${t.last_name}` },
          ]}
          actions={
            <Link
              href={`/dashboard/teachers/${t.teacher_id}/edit`}
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

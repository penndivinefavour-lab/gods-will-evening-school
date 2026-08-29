/* eslint-disable @typescript-eslint/no-explicit-any */
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import ErrorState from '@/components/ui/error-state'
import { getStudent } from '@/lib/api/school-core'
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

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let student: Awaited<ReturnType<typeof getStudent>> | null = null
  let error: string | null = null

  try {
    const result = await getStudent(id)
    student = result as any
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load student'
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (!student) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Student not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  const s = student as any

  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Full Name', value: `${s.first_name} ${s.middle_name ? s.middle_name + ' ' : ''}${s.last_name}`.trim() },
        { label: 'Preferred Name', value: formatField(s.preferred_name) },
        { label: 'Gender', value: s.gender?.charAt(0).toUpperCase() + s.gender?.slice(1) },
        { label: 'Date of Birth', value: formatDate(s.date_of_birth) },
        { label: 'Place of Birth', value: formatField(s.place_of_birth) },
        { label: 'Nationality', value: formatField(s.nationality) },
      ],
    },
    {
      title: 'Academic Information',
      fields: [
        { label: 'Admission Number', value: s.admission_number },
        { label: 'Status', value: <StatusBadgeWrapper status={s.status} /> },
        { label: 'Previous School', value: formatField(s.previous_school) },
        { label: 'GCE Level', value: formatField(s.gce_level) },
        { label: 'Candidate Status', value: formatField(s.candidate_status) },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { label: 'Region', value: formatField(s.region) },
        { label: 'Division', value: formatField(s.division) },
        { label: 'Residential Address', value: formatField(s.residential_address) },
        { label: 'Phone', value: formatField(s.phone) },
        { label: 'Email', value: formatField(s.email) },
        { label: 'Emergency Contact', value: formatField(s.emergency_contact) },
      ],
    },
    {
      title: 'Health & Notes',
      fields: [
        { label: 'Health Notes', value: formatField(s.health_notes) },
      ],
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`${s.first_name} ${s.last_name}`}
          description={`Student record · ${s.admission_number}`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Students', href: '/dashboard/students' },
            { label: `${s.first_name} ${s.last_name}` },
          ]}
          actions={
            <div className="flex gap-2">
              <Link
                href={`/dashboard/students/${s.student_id}/edit`}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
              >
                Edit
              </Link>
            </div>
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

function StatusBadgeWrapper({ status }: { status: string }) {
  const style: Record<string, { bg: string; text: string }> = {
    active: { bg: '#dcfce7', text: '#166534' },
    inactive: { bg: '#f1f5f9', text: '#475569' },
    graduated: { bg: '#dbeafe', text: '#1e40af' },
    transferred: { bg: '#fef9c3', text: '#854d0e' },
    suspended: { bg: '#fee2e2', text: '#991b1b' },
  }
  const s = style[status.toLowerCase()] || { bg: '#f1f5f9', text: '#475569' }
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  )
}

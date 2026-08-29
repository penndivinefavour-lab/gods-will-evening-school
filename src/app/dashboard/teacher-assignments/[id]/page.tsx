/* eslint-disable @typescript-eslint/no-explicit-any */
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import ErrorState from '@/components/ui/error-state'
import { getTeacherAssignment } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

export default async function TeacherAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let assignment: Awaited<ReturnType<typeof getTeacherAssignment>> | null = null
  let error: string | null = null

  try {
    const result = await getTeacherAssignment(id)
    assignment = result as any
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load teacher assignment'
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (!assignment) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Teacher assignment not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  const a = assignment as any

  const sections = [
    {
      title: 'Assignment Details',
      fields: [
        { label: 'Teacher ID', value: a.teacher_id },
        { label: 'Class ID', value: a.class_id },
        { label: 'Subject ID', value: a.subject_id },
      ],
    },
  ]

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Teacher Assignment"
          description="View assignment details."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Teacher Assignments', href: '/dashboard/teacher-assignments' },
            { label: a.teacher_assignment_id },
          ]}
          actions={
            <Link
              href={`/dashboard/teacher-assignments/${a.teacher_assignment_id}/edit`}
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

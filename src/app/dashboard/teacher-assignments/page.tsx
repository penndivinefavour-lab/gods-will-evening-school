/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listTeacherAssignments } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function AssignmentsTable() {
  let data: Awaited<ReturnType<typeof listTeacherAssignments>> | null = null
  let error: string | null = null

  try {
    data = await listTeacherAssignments({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load teacher assignments'
  }

  const columns = [
    {
      key: 'teacher_id',
      header: 'Teacher',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.teacher_id}
        </span>
      ),
    },
    { key: 'class_id', header: 'Class', render: (item: any) => item.class_id },
    { key: 'subject_id', header: 'Subject', render: (item: any) => item.subject_id },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.teacher_assignment_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No teacher assignments found"
      emptyDescription="Assign teachers to classes and subjects."
      emptyActionLabel="New Assignment"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/teacher-assignments/${item.teacher_assignment_id}`}
    />
  )
}

export default function TeacherAssignmentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Teacher Assignments"
          description="Assign teachers to classes and subjects."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teacher Assignments' }]}
          actions={
            <Link
              href="/dashboard/teacher-assignments/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              New Assignment
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading assignments..." />}>
          <AssignmentsTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listStudents } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function StudentsTable() {
  let data: { data: Awaited<ReturnType<typeof listStudents>> } | null = null
  let error: string | null = null

  try {
    data = await listStudents({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load students'
  }

  const columns = [
    {
      key: 'admission_number',
      header: 'Admission No.',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.admission_number}
        </span>
      ),
    },
    { key: 'first_name', header: 'First Name', render: (item: any) => `${item.first_name} ${item.last_name || ''}`.trim() },
    { key: 'gender', header: 'Gender', render: (item: any) => item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1) },
    { key: 'status', header: 'Status', render: (item: any) => <StatusBadgeWrapper status={item.status} /> },
    { key: 'phone', header: 'Phone', render: (item: any) => item.phone || '—' },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.student_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No students found"
      emptyDescription="Get started by creating your first student record."
      emptyActionLabel="Add Student"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/students/${item.student_id}`}
    />
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

export default function StudentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Students"
          description="Manage student profiles, records, and enrollment."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
          actions={
            <Link
              href="/dashboard/students/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Student
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading students..." />}>
          <StudentsTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

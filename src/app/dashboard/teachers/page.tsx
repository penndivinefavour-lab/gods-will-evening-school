/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listTeachers } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function TeachersTable() {
  let data: Awaited<ReturnType<typeof listTeachers>> | null = null
  let error: string | null = null

  try {
    data = await listTeachers({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load teachers'
  }

  const columns = [
    {
      key: 'staff_id',
      header: 'Staff ID',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.staff_id}
        </span>
      ),
    },
    { key: 'first_name', header: 'Name', render: (item: any) => `${item.first_name} ${item.last_name || ''}`.trim() },
    { key: 'employment_status', header: 'Status', render: (item: any) => <span className='inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize' style={{ backgroundColor: item.employment_status === 'full_time' ? '#e0e7ff' : item.employment_status === 'part_time' ? '#fce7f3' : '#ccfbf1', color: item.employment_status === 'full_time' ? '#3730a3' : item.employment_status === 'part_time' ? '#9d174d' : '#115e59' }}>{item.employment_status?.replace('_', ' ')}</span> },
    { key: 'specialization', header: 'Specialization', render: (item: any) => item.specialization || '—' },
    { key: 'phone', header: 'Phone', render: (item: any) => item.phone || '—' },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.teacher_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No teachers found"
      emptyDescription="Add your first teacher to get started."
      emptyActionLabel="Add Teacher"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/teachers/${item.teacher_id}`}
    />
  )
}

export default function TeachersPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Teachers"
          description="Manage teacher profiles and employment details."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Teachers' }]}
          actions={
            <Link
              href="/dashboard/teachers/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Teacher
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading teachers..." />}>
          <TeachersTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

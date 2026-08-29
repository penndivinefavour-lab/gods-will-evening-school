/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listClasses } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function ClassesTable() {
  let data: Awaited<ReturnType<typeof listClasses>> | null = null
  let error: string | null = null

  try {
    data = await listClasses({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load classes'
  }

  const columns = [
    {
      key: 'name',
      header: 'Class Name',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.display_name || item.name}
        </span>
      ),
    },
    { key: 'stream', header: 'Stream', render: (item: any) => item.stream || '—' },
    { key: 'capacity', header: 'Capacity', render: (item: any) => item.capacity ?? '—' },
    { key: 'status', header: 'Status', render: (item: any) => <span className='inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize' style={{ backgroundColor: item.status === 'active' ? '#dcfce7' : '#f1f5f9', color: item.status === 'active' ? '#166534' : '#475569' }}>{item.status}</span> },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.class_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No classes found"
      emptyDescription="Create your first class to begin organizing enrollments."
      emptyActionLabel="Add Class"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/classes/${item.class_id}`}
    />
  )
}

export default function ClassesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Classes"
          description="Manage classes, streams, and capacity."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes' }]}
          actions={
            <Link
              href="/dashboard/classes/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Class
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading classes..." />}>
          <ClassesTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

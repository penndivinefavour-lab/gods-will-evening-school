/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listSubjects } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function SubjectsTable() {
  let data: Awaited<ReturnType<typeof listSubjects>> | null = null
  let error: string | null = null

  try {
    data = await listSubjects({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load subjects'
  }

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.code || '—'}
        </span>
      ),
    },
    { key: 'name', header: 'Name', render: (item: any) => item.name },
    { key: 'description', header: 'Description', render: (item: any) => item.description || '—' },
    { key: 'active', header: 'Active', render: (item: any) => (item.active ? 'Yes' : 'No') },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.subject_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No subjects found"
      emptyDescription="Add your first subject to the catalog."
      emptyActionLabel="Add Subject"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/subjects/${item.subject_id}`}
    />
  )
}

export default function SubjectsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Subjects"
          description="Manage the subject catalog."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Subjects' }]}
          actions={
            <Link
              href="/dashboard/subjects/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Subject
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading subjects..." />}>
          <SubjectsTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

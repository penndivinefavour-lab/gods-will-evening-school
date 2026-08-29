/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listGuardians } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function GuardiansTable() {
  let data: Awaited<ReturnType<typeof listGuardians>> | null = null
  let error: string | null = null

  try {
    data = await listGuardians({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load guardians'
  }

  const columns = [
    {
      key: 'first_name',
      header: 'Name',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.first_name} {item.last_name}
        </span>
      ),
    },
    { key: 'relationship', header: 'Relationship', render: (item: any) => item.relationship || '—' },
    { key: 'phone', header: 'Phone', render: (item: any) => item.phone },
    { key: 'email', header: 'Email', render: (item: any) => item.email || '—' },
    { key: 'emergency_contact', header: 'Emergency', render: (item: any) => (item.emergency_contact ? 'Yes' : 'No') },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.guardian_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No guardians found"
      emptyDescription="Add your first guardian to start linking them to students."
      emptyActionLabel="Add Guardian"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/guardians/${item.guardian_id}`}
    />
  )
}

export default function GuardiansPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Guardians"
          description="Manage guardian contacts and relationships."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Guardians' }]}
          actions={
            <Link
              href="/dashboard/guardians/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Guardian
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading guardians..." />}>
          <GuardiansTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

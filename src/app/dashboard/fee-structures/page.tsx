/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listFeeStructures } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function FeeStructuresTable() {
  let data: Awaited<ReturnType<typeof listFeeStructures>> | null = null
  let error: string | null = null

  try {
    data = await listFeeStructures({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load fee structures'
  }

  const columns = [
    {
      key: 'name',
      header: 'Fee',
      render: (item: any) => (
        <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.name}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: any) => (
        <span className="font-mono">
          {item.amount} {item.currency || 'XAF'}
        </span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (item: any) => item.frequency || 'one_time',
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item: any) => (
        <span
          className='inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize'
          style={{
            backgroundColor: item.is_active ? '#dcfce7' : '#f1f5f9',
            color: item.is_active ? '#166534' : '#475569',
          }}
        >
          {item.is_active ? 'active' : 'inactive'}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.fee_structure_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No fee structures found"
      emptyDescription="Create your first fee structure to begin issuing invoices."
      emptyActionLabel="Add Fee Structure"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/fee-structures/${item.fee_structure_id}`}
    />
  )
}

export default function FeeStructuresPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Fee Structures"
          description="Manage billing items and standard charges."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fee Structures' }]}
          actions={
            <Link
              href="/dashboard/fee-structures/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              Add Fee Structure
            </Link>
          }
        />
        <Suspense fallback={<LoadingState message="Loading fee structures..." />}>
          <FeeStructuresTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listReceipts } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function ReceiptsTable() {
  let data: Awaited<ReturnType<typeof listReceipts>> | null = null
  let error: string | null = null

  try {
    data = await listReceipts({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load receipts'
  }

  const columns = [
    {
      key: 'receipt_id',
      header: 'Receipt',
      render: (item: any) => (
        <span className="font-mono text-xs" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.receipt_number || item.receipt_id}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: any) => (
        <span className="font-mono">{item.amount} XAF</span>
      ),
    },
    {
      key: 'paid_by',
      header: 'Paid By',
      render: (item: any) => item.paid_by || '—',
    },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.receipt_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No receipts found"
      emptyDescription="Generate receipts from confirmed payments."
      emptyActionLabel="New Receipt"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/receipts/${item.receipt_id}`}
    />
  )
}

export default function ReceiptsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Receipts"
          description="Payment receipts and proof of payment records."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Receipts' }]}
        />
        <Suspense fallback={<LoadingState message="Loading receipts..." />}>
          <ReceiptsTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

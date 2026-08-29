/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listPayments } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function PaymentsTable() {
  let data: Awaited<ReturnType<typeof listPayments>> | null = null
  let error: string | null = null

  try {
    data = await listPayments({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load payments'
  }

  const columns = [
    {
      key: 'payment_id',
      header: 'Payment',
      render: (item: any) => (
        <span className="font-mono text-xs" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.payment_id}
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
      key: 'method',
      header: 'Method',
      render: (item: any) => item.method || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <span
          className='inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize'
          style={{
            backgroundColor: item.status === 'confirmed' ? '#dcfce7' : '#f1f5f9',
            color: item.status === 'confirmed' ? '#166534' : '#475569',
          }}
        >
          {item.status}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      keyExtractor={(item) => item.payment_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No payments found"
      emptyDescription="Record payments against invoices to track collections."
      emptyActionLabel="Record Payment"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/payments/${item.payment_id}`}
    />
  )
}

export default function PaymentsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payments"
          description="Payments, methods, and collection status."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Payments' }]}
        />
        <Suspense fallback={<LoadingState message="Loading payments..." />}>
          <PaymentsTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

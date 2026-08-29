/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listInvoices } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

export const dynamic = 'force-dynamic'

async function InvoicesTable() {
  let data: Awaited<ReturnType<typeof listInvoices>> | null = null
  let error: string | null = null

  try {
    data = await listInvoices({ limit: 50 })
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load invoices'
  }

  const columns = [
    {
      key: 'invoice_id',
      header: 'Invoice',
      render: (item: any) => (
        <span className="font-mono text-xs" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {item.invoice_id}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: any) => (
        <span className="font-mono">{item.amount}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <span
          className='inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize'
          style={{
            backgroundColor:
              item.status === 'paid'
                ? '#dcfce7'
                : item.status === 'issued'
                  ? '#fef9c3'
                  : item.status === 'void'
                    ? '#fee2e2'
                    : '#f1f5f9',
            color:
              item.status === 'paid'
                ? '#166534'
                : item.status === 'issued'
                  ? '#854d0e'
                  : item.status === 'void'
                    ? '#991b1b'
                    : '#475569',
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
      keyExtractor={(item) => item.invoice_id}
      loading={false}
      error={error}
      onRetry={() => window.location.reload()}
      emptyTitle="No invoices found"
      emptyDescription="Create invoices from fee structures to begin billing."
      emptyActionLabel="New Invoice"
      onEmptyAction={() => {}}
      getRowHref={(item) => `/dashboard/invoices/${item.invoice_id}`}
    />
  )
}

export default function InvoicesPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Invoices"
          description="Student invoices and billing status."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invoices' }]}
          actions={
            <a
              href="/dashboard/invoices/new"
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              New Invoice
            </a>
          }
        />
        <Suspense fallback={<LoadingState message="Loading invoices..." />}>
          <InvoicesTable />
        </Suspense>
      </div>
    </AppShell>
  )
}

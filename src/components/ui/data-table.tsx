'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'
import LoadingState from './loading-state'
import EmptyState from './empty-state'
import ErrorState from './error-state'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  getRowHref?: (item: T) => string
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  getRowHref,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingState message="Loading records..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  const rows = (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y" style={{ borderColor: '#e2e8f0' }}>
        <thead style={{ backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${col.className || ''}`}
                style={{ color: BRANDING_DEFAULTS.colors.muted }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`transition-colors ${getRowHref ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-sm ${col.className || ''}`}
                  style={{ color: BRANDING_DEFAULTS.colors.text }}
                >
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (getRowHref) {
    return (
      <div className="flex flex-col gap-3">
        {data.map((item) => (
          <a
            key={keyExtractor(item)}
            href={getRowHref(item)}
            className="block rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e2e8f0' }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: '#e2e8f0' }}>
                <thead style={{ backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${col.className || ''}`}
                        style={{ color: BRANDING_DEFAULTS.colors.muted }}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
                  <tr>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap px-4 py-3 text-sm ${col.className || ''}`}
                        style={{ color: BRANDING_DEFAULTS.colors.text }}
                      >
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </a>
        ))}
      </div>
    )
  }

  return rows
}

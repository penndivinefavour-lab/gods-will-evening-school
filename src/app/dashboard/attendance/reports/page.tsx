'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/page-header'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { BRANDING_DEFAULTS } from '@/config/branding'

type ReportResponse = {
  filters: Record<string, string | null>
  totals: Record<string, number>
  attendance_percentage: number
  records: Array<{
    attendance_record_id: string
    school_id: string
    student_id: string
    class_id: string
    attendance_date: string
    status: string
    reason: string | null
    notes: string | null
  }>
}

export default function AttendanceReportsPage() {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/attendance/reports')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load attendance reports')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setReport(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unexpected error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Attendance Reports" description="Attendance summaries and filters." />

      <div className="flex gap-2">
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            fetch('/api/attendance/reports')
              .then((response) => {
                if (!response.ok) throw new Error('Failed to load attendance reports')
                return response.json()
              })
              .then(setReport)
              .catch((err) => setError(err instanceof Error ? err.message : 'Unexpected error'))
              .finally(() => setLoading(false))
          }}
          style={{
            padding: '0.6rem 0.9rem',
            borderRadius: '0.4rem',
            border: 'none',
            backgroundColor: BRANDING_DEFAULTS.colors.primary,
            color: '#ffffff',
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState message="Loading reports..." />}

      {!loading && report && (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(['total', 'present', 'absent', 'late', 'excused'] as const).map((key) => (
              <div key={key} className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
                <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>{key.toUpperCase()}</div>
                <div className="text-xl font-bold" style={{ color: BRANDING_DEFAULTS.colors.text }}>{report.totals[key]}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
            <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>ATTENDANCE PERCENTAGE</div>
            <div className="text-xl font-bold" style={{ color: BRANDING_DEFAULTS.colors.text }}>{report.attendance_percentage}%</div>
          </div>

          {report.records.length === 0 && (
            <div className="rounded-lg border p-6 text-center text-sm" style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.muted }}>
              No records match the current filters.
            </div>
          )}

          <div className="grid gap-4">
            {report.records.map((record) => (
              <div key={record.attendance_record_id} className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
                <div className="font-semibold" style={{ color: BRANDING_DEFAULTS.colors.text }}>
                  {record.attendance_date} • Class {record.class_id}
                </div>
                <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
                  Student {record.student_id} • {record.status}
                  {record.reason ? ` • ${record.reason}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

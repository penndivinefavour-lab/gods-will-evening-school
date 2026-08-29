'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/page-header'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { BRANDING_DEFAULTS } from '@/config/branding'

type AttendanceRecord = {
  attendance_record_id: string
  school_id: string
  student_id: string
  class_id: string
  enrollment_id: string | null
  teacher_id: string | null
  academic_year_id: string | null
  attendance_date: string
  status: string
  reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/attendance/student/me')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load attendance')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setRecords(data ?? [])
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

  const statusCounts = records.reduce(
    (acc, record) => {
      acc.total += 1
      acc[record.status as keyof typeof acc] += 1
      return acc
    },
    { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Attendance" description="Your attendance history across classes." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(['total', 'present', 'absent', 'late', 'excused'] as const).map((key) => (
          <div key={key} className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
            <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>{key.toUpperCase()}</div>
            <div className="text-xl font-bold" style={{ color: BRANDING_DEFAULTS.colors.text }}>{statusCounts[key]}</div>
          </div>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState message="Loading attendance..." />}

      {!loading && !error && (
        <div className="grid gap-4">
          {records.length === 0 && (
            <div className="rounded-lg border p-6 text-center text-sm" style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.muted }}>
              No attendance records yet.
            </div>
          )}
          {records.map((record) => (
            <div key={record.attendance_record_id} className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold" style={{ color: BRANDING_DEFAULTS.colors.text }}>
                    {record.attendance_date} • Class {record.class_id}
                  </div>
                  <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
                    Status: {record.status}
                    {record.reason ? ` • Reason: ${record.reason}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

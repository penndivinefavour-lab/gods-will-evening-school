'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/page-header'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { BRANDING_DEFAULTS } from '@/config/branding'

type Worksheet = {
  attendance_worksheet_id: string
  school_id: string
  class_id: string
  teacher_id: string | null
  academic_year_id: string | null
  worksheet_date: string
  file_id: string | null
  extraction_status: string
  extraction_result: unknown
  reviewed_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export default function AttendanceWorksheetsPage() {
  const [status, setStatus] = useState<string>('')
  const [classId, setClassId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Worksheet[]>([])
  const [loading, setLoading] = useState(false)

  async function loadWorksheets() {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/attendance/worksheets', window.location.origin)
      if (classId) url.searchParams.set('class_id', classId)
      if (status) url.searchParams.set('status', status)
      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to load worksheets')
      const data = await response.json()
      setItems(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance Worksheets"
        description="Uploaded worksheets, extraction state, review and approval history."
        breadcrumbs={[
          { label: 'Attendance', href: '/dashboard/attendance' },
          { label: 'Worksheets' },
        ]}
        actions={
          <button
            onClick={loadWorksheets}
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
        }
      />

      <div className="flex flex-col gap-4 rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
            Class filter
            <input
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              placeholder="class id"
              style={{ padding: '0.55rem 0.7rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
            Status filter
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ padding: '0.55rem 0.7rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1' }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="extraction">Extraction</option>
              <option value="extracted">Extracted</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <LoadingState message="Loading worksheets..." />}

      {!loading && !error && (
        <div className="grid gap-4">
          {items.length === 0 && (
            <div className="rounded-lg border p-6 text-center text-sm" style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.muted }}>
              No worksheets found.
            </div>
          )}
          {items.map((item) => (
            <div key={item.attendance_worksheet_id} className="rounded-lg border p-4" style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold" style={{ color: BRANDING_DEFAULTS.colors.text }}>
                    Worksheet {item.attendance_worksheet_id.slice(0, 8)}
                  </div>
                  <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
                    Class {item.class_id} • {item.worksheet_date} • {item.extraction_status}
                  </div>
                </div>
                <div className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
                  {item.approved_at ? `Approved ${new Date(item.approved_at).toLocaleString()}` : 'Not approved'}
                </div>
              </div>
              {item.rejection_reason && (
                <div className="mt-2 text-sm" style={{ color: '#b91c1c' }}>
                  Rejection reason: {item.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

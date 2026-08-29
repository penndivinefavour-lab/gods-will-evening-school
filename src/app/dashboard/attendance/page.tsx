'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import DataTable from '@/components/ui/data-table'
import LoadingState from '@/components/ui/loading-state'
import { listClasses, listAttendanceRecords, createAttendanceRecord, updateAttendanceRecord } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'
import Link from 'next/link'

type StatusOption = 'present' | 'absent' | 'late' | 'excused'

type AttendanceDraft = {
  enrollment_id?: string
  student_id: string
  student_name: string
  admission_number: string
  status: StatusOption
  reason: string
  notes: string
}

export default function AttendancePage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [classes, setClasses] = useState<{ class_id: string; display_name: string }[]>([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [roster, setRoster] = useState<AttendanceDraft[]>([])
  const [records, setRecords] = useState<AttendanceDraft[]>([])
  const classIdRef = useRef(classId)
  const dateRef = useRef(date)

  useEffect(() => {
    classIdRef.current = classId
    dateRef.current = date
  }, [classId, date])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const result = await listClasses({ limit: 50 })
        if (cancelled) return
        const items = (result as { data: { class_id: string; name: string; stream: string | null; display_name: string | null }[] }).data ?? []
        setClasses(items.map((item) => ({ class_id: item.class_id, display_name: item.display_name || item.name })))
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load classes')
      } finally {
        if (!cancelled) setClassesLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const currentClassId = classIdRef.current
      const currentDate = dateRef.current
      if (!currentClassId) {
        setRoster([])
        setRecords([])
        setRegisterLoading(false)
        return
      }
      setRegisterLoading(true)
      setError(null)
      setSuccess(null)
      try {
        const [rosterData, recordsResult] = await Promise.all([
          fetch(`/api/attendance/roster?class_id=${encodeURIComponent(currentClassId)}`).then((r) => r.json()),
          listAttendanceRecords({ class_id: currentClassId, date_from: currentDate, date_to: currentDate }),
        ])
        if (cancelled) return
        const rosterItems = (rosterData as AttendanceDraft[]) ?? []
        const attendanceItems = (recordsResult as { data: AttendanceDraft[] }).data ?? []
        const mapped = rosterItems.map((item) => ({
          ...item,
          status: 'present' as StatusOption,
          reason: '',
          notes: '',
        }))
        setRoster(mapped)
        setRecords(attendanceItems)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load attendance data')
      } finally {
        if (!cancelled) setRegisterLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [classId, date])

  const merged = roster.map((row) => {
    const existing = records.find((record) => record.student_id === row.student_id)
    if (existing) {
      return {
        ...row,
        status: (existing.status as StatusOption) || row.status,
        reason: existing.reason || row.reason || '',
        notes: existing.notes || row.notes || '',
      }
    }
    return row
  })

  const updateDraft = (studentId: string, patch: Partial<AttendanceDraft>) => {
    setRoster((prev) => prev.map((row) => row.student_id === studentId ? { ...row, ...patch } : row))
  }

  const markAll = (status: StatusOption) => {
    setRoster((prev) => prev.map((row) => ({ ...row, status, reason: status === 'present' ? '' : row.reason, notes: row.notes })))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const results: string[] = []
    for (const row of merged) {
      const payload = {
        student_id: row.student_id,
        class_id: classId,
        attendance_date: date,
        status: row.status,
        reason: row.status === 'present' ? null : row.reason || null,
        notes: row.notes || null,
      }
      try {
        const existing = records.find((record) => record.student_id === row.student_id)
        if (existing) {
          await updateAttendanceRecord(existing.student_id, payload)
        } else {
          await createAttendanceRecord(payload)
        }
        results.push(`${row.student_name}: ${row.status}`)
      } catch {
        results.push(`${row.student_name}: failed`)
      }
    }
    setSuccess(`Saved: ${results.join(', ')}`)
    setSaving(false)
  }

  const countByStatus = (status: StatusOption) => merged.filter((row) => row.status === status).length

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Attendance"
          description="Mark attendance for a class session."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Attendance' }]}
          actions={
            <>
              <Link
                href="/dashboard/attendance/worksheets"
                className="rounded-md border px-4 py-2 text-sm font-medium"
                style={{ borderColor: '#cbd5e1', color: BRANDING_DEFAULTS.colors.text }}
              >
                Worksheets
              </Link>
              <Link
                href="/dashboard/attendance/reports"
                className="rounded-md border px-4 py-2 text-sm font-medium"
                style={{ borderColor: '#cbd5e1', color: BRANDING_DEFAULTS.colors.text }}
              >
                Reports
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md border px-4 py-2 text-sm font-medium"
                style={{ borderColor: '#cbd5e1', color: BRANDING_DEFAULTS.colors.text }}
              >
                Back to dashboard
              </Link>
            </>
          }
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</div>
        )}

        <form className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end" style={{ borderColor: '#e2e8f0' }}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Class</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
            >
              <option value="">Select class</option>
              {classes.map((item) => (
                <option key={item.class_id} value={item.class_id}>{item.display_name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => markAll('present')} className="rounded-md border px-3 py-2 text-sm font-medium" style={{ borderColor: '#cbd5e1' }}>Mark all present</button>
          </div>
        </form>

        {classesLoading && <LoadingState message="Loading classes..." />}
        {!classesLoading && !classId && (
          <div className="rounded-md border p-6 text-center text-sm" style={{ borderColor: '#e2e8f0' }}>
            Select a class and date to begin taking attendance.
          </div>
        )}
        {!classesLoading && !registerLoading && classId && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-md border px-3 py-1" style={{ borderColor: '#e2e8f0' }}>Present: {countByStatus('present')}</span>
              <span className="rounded-md border px-3 py-1" style={{ borderColor: '#e2e8f0' }}>Absent: {countByStatus('absent')}</span>
              <span className="rounded-md border px-3 py-1" style={{ borderColor: '#e2e8f0' }}>Late: {countByStatus('late')}</span>
              <span className="rounded-md border px-3 py-1" style={{ borderColor: '#e2e8f0' }}>Excused: {countByStatus('excused')}</span>
            </div>
            <DataTable
              data={merged}
              columns={[
                {
                  key: 'student_name',
                  header: 'Student',
                  render: (item: AttendanceDraft) => <span className="font-medium">{item.student_name}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: AttendanceDraft) => (
                    <select
                      value={item.status}
                      onChange={(e) => updateDraft(item.student_id, { status: e.target.value as StatusOption })}
                      className="rounded-md border px-2 py-1 text-sm"
                      style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  ),
                },
                {
                  key: 'reason',
                  header: 'Reason',
                  render: (item: AttendanceDraft) => (
                    <input
                      value={item.reason}
                      onChange={(e) => updateDraft(item.student_id, { reason: e.target.value })}
                      disabled={item.status === 'present'}
                      placeholder={item.status === 'present' ? 'Not required' : 'Reason'}
                      className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
                      style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
                    />
                  ),
                },
                {
                  key: 'notes',
                  header: 'Notes',
                  render: (item: AttendanceDraft) => (
                    <input
                      value={item.notes}
                      onChange={(e) => updateDraft(item.student_id, { notes: e.target.value })}
                      placeholder="Optional notes"
                      className="rounded-md border px-2 py-1 text-sm"
                      style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
                    />
                  ),
                },
              ]}
              keyExtractor={(item) => item.student_id}
              loading={false}
              error={null}
              onRetry={() => {}}
              emptyTitle="No students available"
              emptyDescription="Select a class to load the attendance register."
              emptyActionLabel={undefined}
              onEmptyAction={() => {}}
              getRowHref={() => ''}
            />
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={saving || !classId}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        )}
        {registerLoading && classId && <LoadingState message="Saving attendance..." />}
      </div>
    </AppShell>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import FormField from '@/components/ui/form-field'
import {
  getTeacherAssignment,
  updateTeacherAssignment,
  listTeachers,
  listClasses,
  listSubjects,
  Teacher,
  Class as ClassType,
  Subject,
} from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function EditTeacherAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [resolvedId, setResolvedId] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<ClassType[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [form, setForm] = useState({
    teacher_id: '',
    class_id: '',
    subject_id: '',
  })

  useEffect(() => {
    let cancelled = false
    params.then((p) => {
      if (cancelled) return
      const id = p.id
      setResolvedId(id)
      setLoading(true)
      Promise.all([
        getTeacherAssignment(id),
        listTeachers({ limit: 100 }),
        listClasses({ limit: 100 }),
        listSubjects({ limit: 100 }),
      ]).then(([assignment, t, c, s]) => {
        if (cancelled) return
        const data = (assignment as any).data
        setForm({
          teacher_id: data.teacher_id || '',
          class_id: data.class_id || '',
          subject_id: data.subject_id || '',
        })
        setTeachers((t as any).data ?? [])
        setClasses((c as any).data ?? [])
        setSubjects((s as any).data ?? [])
        setLoading(false)
      }).catch((err) => {
        if (cancelled) return
        if ((err as Error).message.includes('not found')) {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load assignment')
        }
        setLoading(false)
      })
    })
    return () => { cancelled = true }
  }, [params])

  const update = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateTeacherAssignment(resolvedId, form)
      router.push(`/dashboard/teacher-assignments/${resolvedId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Teacher assignment not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Loading assignment..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Edit Teacher Assignment"
          description="Update teacher, class, or subject assignment."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Teacher Assignments', href: '/dashboard/teacher-assignments' },
            { label: 'Edit Assignment' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Teacher"
              name="teacher_id"
              value={form.teacher_id}
              onChange={(v) => update('teacher_id', v)}
              required
              options={teachers.map((t) => ({ label: `${t.first_name} ${t.last_name} (${t.staff_id})`, value: t.teacher_id }))}
            />
            <FormField
              label="Class"
              name="class_id"
              value={form.class_id}
              onChange={(v) => update('class_id', v)}
              required
              options={classes.map((c) => ({ label: c.display_name || c.name, value: c.class_id }))}
            />
            <FormField
              label="Subject"
              name="subject_id"
              value={form.subject_id}
              onChange={(v) => update('subject_id', v)}
              required
              options={subjects.map((s) => ({ label: `${s.name} (${s.code || '—'})`, value: s.subject_id }))}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/dashboard/teacher-assignments/${resolvedId}`}
              className="rounded-md border px-4 py-2 text-sm font-medium"
              style={{ borderColor: '#cbd5e1', color: BRANDING_DEFAULTS.colors.text }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

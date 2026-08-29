/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import { createTeacher } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

const EMPLOYMENT_STATUS_OPTIONS = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
]

export default function NewTeacherPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    staff_id: '',
    first_name: '',
    last_name: '',
    qualifications: '',
    specialization: '',
    phone: '',
    email: '',
    employment_status: 'full_time',
    date_joined: '',
    emergency_contact: '',
  })

  const update = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.staff_id || !form.first_name || !form.last_name || !form.employment_status) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      const data = await createTeacher(form)
      router.push(`/dashboard/teachers/${(data as any).data.teacher_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create teacher')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add Teacher"
          description="Create a new teacher record."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Teachers', href: '/dashboard/teachers' },
            { label: 'Add Teacher' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Staff ID" name="staff_id" value={form.staff_id} onChange={(v) => update('staff_id', v)} required />
            <FormField label="First Name" name="first_name" value={form.first_name} onChange={(v) => update('first_name', v)} required />
            <FormField label="Last Name" name="last_name" value={form.last_name} onChange={(v) => update('last_name', v)} required />
            <FormField label="Qualifications" name="qualifications" value={form.qualifications || ''} onChange={(v) => update('qualifications', v)} />
            <FormField label="Specialization" name="specialization" value={form.specialization || ''} onChange={(v) => update('specialization', v)} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone || ''} onChange={(v) => update('phone', v)} />
            <FormField label="Email" name="email" type="email" value={form.email || ''} onChange={(v) => update('email', v)} />
            <FormField label="Employment Status" name="employment_status" value={form.employment_status} onChange={(v) => update('employment_status', v)} options={EMPLOYMENT_STATUS_OPTIONS} required />
            <FormField label="Date Joined" name="date_joined" type="date" value={form.date_joined} onChange={(v) => update('date_joined', v)} />
            <FormField label="Emergency Contact" name="emergency_contact" value={form.emergency_contact} onChange={(v) => update('emergency_contact', v)} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/teachers"
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
              {saving ? 'Saving...' : 'Create Teacher'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

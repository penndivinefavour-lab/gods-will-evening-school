/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import { createClass } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function NewClassPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    stream: '',
    display_name: '',
    capacity: '',
    status: 'active',
    academic_year_id: '',
  })

  const update = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name || !form.status) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      const data = await createClass({
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        academic_year_id: form.academic_year_id || null,
      })
      router.push(`/dashboard/classes/${(data as any).data.class_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add Class"
          description="Create a new class record."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/dashboard/classes' },
            { label: 'Add Class' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Class Name" name="name" value={form.name} onChange={(v) => update('name', v)} required />
            <FormField label="Stream" name="stream" value={form.stream} onChange={(v) => update('stream', v)} />
            <FormField label="Display Name" name="display_name" value={form.display_name} onChange={(v) => update('display_name', v)} />
            <FormField label="Capacity" name="capacity" type="number" value={form.capacity} onChange={(v) => update('capacity', v)} />
            <FormField label="Status" name="status" value={form.status} onChange={(v) => update('status', v)} options={STATUS_OPTIONS} required />
            <FormField label="Academic Year ID" name="academic_year_id" value={form.academic_year_id} onChange={(v) => update('academic_year_id', v)} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/classes"
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
              {saving ? 'Saving...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

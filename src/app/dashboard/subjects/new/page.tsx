/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import { createSubject } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function NewSubjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string |null>(null)

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    active: true,
  })

  const update = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name || !form.code) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      const data = await createSubject(form)
      router.push(`/dashboard/subjects/${(data as any).data.subject_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add Subject"
          description="Create a new subject in the catalog."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Subjects', href: '/dashboard/subjects' },
            { label: 'Add Subject' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Subject Name" name="name" value={form.name} onChange={(v) => update('name', v)} required />
            <FormField label="Subject Code" name="code" value={form.code} onChange={(v) => update('code', v)} required />
            <div className="sm:col-span-2">
              <FormField label="Description" name="description" value={form.description} onChange={(v) => update('description', v)} rows={3} />
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: BRANDING_DEFAULTS.colors.text }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Active
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/subjects"
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
              {saving ? 'Saving...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

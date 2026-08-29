 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { getClass, updateClass } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()


  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [resolvedId, setResolvedId] = useState('')

  const [form, setForm] = useState({
    name: '',
    stream: '',
    display_name: '',
    capacity: '',
    status: 'active',
    academic_year_id: '',
  })
  useEffect(() => {
    let cancelled = false
    params.then((p) => {
      if (cancelled) return
      const id = p.id
      setResolvedId(id)
      getClass(id)
        .then((result) => {
          if (cancelled) return
          const data = (result as { data: { name: string; stream: string | null; display_name: string | null; capacity: number | null; status: string; academic_year_id: string | null } }).data
          setForm({
            name: data.name || '',
            stream: data.stream || '',
            display_name: data.display_name || '',
            capacity: data.capacity ? String(data.capacity) : '',
            status: data.status || 'active',
            academic_year_id: data.academic_year_id || '',
          })
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          if ((err as Error).message.includes('not found')) {
            setNotFound(true)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load class')
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
      await updateClass(resolvedId, {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        academic_year_id: form.academic_year_id || null,
      })
      router.push(`/dashboard/classes/${resolvedId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Class not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Loading class..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Edit Class"
          description="Update class information."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Classes', href: '/dashboard/classes' },
            { label: 'Edit Class' },
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
              href={`/dashboard/classes/${resolvedId}`}
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

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { getSubject, updateSubject } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [resolvedId, setResolvedId] = useState("")

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    active: true,
  })
  useEffect(() => {
    let cancelled = false
    params.then((p) => {
      if (cancelled) return
      const id = p.id
      setResolvedId(id)
      setLoading(true)
      return getSubject(id)
        .then((result) => {
          if (cancelled) return
          const data = (result as any).data
          setForm({
            name: data.name || '',
            code: data.code || '',
            description: data.description || '',
            active: data.active ?? true,
          })
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          if ((err as Error).message.includes('not found')) {
            setNotFound(true)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load subject')
          }
          setLoading(false)
        })
    })
    return () => { cancelled = true }
  }, [params])




  const update = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await updateSubject(resolvedId, form)
      router.push(`/dashboard/subjects/${resolvedId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subject')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Subject not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Loading subject..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Edit Subject"
          description="Update subject details."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Subjects', href: '/dashboard/subjects' },
            { label: 'Edit Subject' },
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
              href={`/dashboard/subjects/${resolvedId}`}
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

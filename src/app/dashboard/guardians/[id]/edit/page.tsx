/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { getGuardian, updateGuardian } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function EditGuardianPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [resolvedId, setResolvedId] = useState('')

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    relationship: '',
    phone: '',
    alternative_phone: '',
    email: '',
    occupation: '',
    address: '',
    emergency_contact: false,
  })

  useEffect(() => {
    let cancelled = false
    params.then((p) => {
      if (cancelled) return
      const id = p.id
      setResolvedId(id)
      setLoading(true)
      return getGuardian(id)
        .then((result) => {
          if (cancelled) return
          const data = (result as any).data
          setForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            relationship: data.relationship || '',
            phone: data.phone || '',
            alternative_phone: data.alternative_phone || '',
            email: data.email || '',
            occupation: data.occupation || '',
            address: data.address || '',
            emergency_contact: data.emergency_contact || false,
          })
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          if ((err as Error).message.includes('not found')) {
            setNotFound(true)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load guardian')
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
      await updateGuardian(resolvedId, form)
      router.push(`/dashboard/guardians/${resolvedId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guardian')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Guardian not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Loading guardian..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Edit Guardian"
          description="Update guardian information."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Guardians', href: '/dashboard/guardians' },
            { label: 'Edit Guardian' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" name="first_name" value={form.first_name} onChange={(v) => update('first_name', v)} required />
            <FormField label="Last Name" name="last_name" value={form.last_name} onChange={(v) => update('last_name', v)} required />
            <FormField label="Relationship" name="relationship" value={form.relationship || ''} onChange={(v) => update('relationship', v)} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={(v) => update('phone', v)} required />
            <FormField label="Alternative Phone" name="alternative_phone" type="tel" value={form.alternative_phone || ''} onChange={(v) => update('alternative_phone', v)} />
            <FormField label="Email" name="email" type="email" value={form.email || ''} onChange={(v) => update('email', v)} />
            <FormField label="Occupation" name="occupation" value={form.occupation || ''} onChange={(v) => update('occupation', v)} />
            <FormField label="Address" name="address" value={form.address || ''} onChange={(v) => update('address', v)} />
            <label className="flex items-center gap-2 text-sm" style={{ color: BRANDING_DEFAULTS.colors.text }}>
              <input
                type="checkbox"
                checked={form.emergency_contact}
                onChange={(e) => update('emergency_contact', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Emergency Contact
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/dashboard/guardians/${resolvedId}`}
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

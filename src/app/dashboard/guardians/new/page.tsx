/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import { createGuardian } from '@/lib/api/school-core'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function NewGuardianPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const update = (name: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.first_name || !form.last_name || !form.phone) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      const data = await createGuardian(form)
      router.push(`/dashboard/guardians/${(data as any).data.guardian_id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guardian')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add Guardian"
          description="Create a new guardian record."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Guardians', href: '/dashboard/guardians' },
            { label: 'Add Guardian' },
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
              href="/dashboard/guardians"
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
              {saving ? 'Saving...' : 'Create Guardian'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

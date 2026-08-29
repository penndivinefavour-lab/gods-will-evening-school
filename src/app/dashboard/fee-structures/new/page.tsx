'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function NewFeeStructurePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get('name') || '').trim(),
      description: String(formData.get('description') || '').trim() || null,
      amount: Number(formData.get('amount') || 0),
      currency: String(formData.get('currency') || 'XAF').trim(),
      frequency: String(formData.get('frequency') || 'one_time').trim(),
      is_active: formData.get('is_active') === 'on',
    }

    try {
      const response = await fetch('/api/fee-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to create fee structure')
      }

      router.push('/dashboard/fee-structures')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fee structure')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="New Fee Structure"
          description="Create a new fee structure."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Fee Structures', href: '/dashboard/fee-structures' },
            { label: 'New' },
          ]}
        />

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border p-6"
          style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="currency">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                required
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="frequency">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
              >
                <option value="one_time">One time</option>
                <option value="monthly">Monthly</option>
                <option value="termly">Termly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="is_active">
                Active
              </label>
              <input id="is_active" name="is_active" type="checkbox" defaultChecked />
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
            >
              {saving ? 'Saving...' : 'Create Fee Structure'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

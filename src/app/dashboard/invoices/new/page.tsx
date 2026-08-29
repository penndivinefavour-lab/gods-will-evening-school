'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function NewInvoicePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      student_id: String(formData.get('student_id') || '').trim(),
      fee_structure_id: String(formData.get('fee_structure_id') || '').trim(),
      amount: Number(formData.get('amount') || 0),
      status: String(formData.get('status') || 'draft').trim(),
    }

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to create invoice')
      }

      router.push('/dashboard/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="New Invoice"
          description="Create an invoice for a student."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Invoices', href: '/dashboard/invoices' },
            { label: 'New' },
          ]}
        />

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border p-6"
          style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="student_id">
              Student ID
            </label>
            <input
              id="student_id"
              name="student_id"
              required
              className="rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="fee_structure_id">
              Fee Structure ID
            </label>
            <input
              id="fee_structure_id"
              name="fee_structure_id"
              required
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
              <label className="text-sm font-medium" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="rounded-md border px-3 py-2 text-sm"
                style={{ borderColor: '#e2e8f0', color: BRANDING_DEFAULTS.colors.text }}
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
                <option value="overdue">Overdue</option>
              </select>
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
              {saving ? 'Saving...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

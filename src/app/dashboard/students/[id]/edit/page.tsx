 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'
import PageHeader from '@/components/ui/page-header'
import FormField from '@/components/ui/form-field'
import LoadingState from '@/components/ui/loading-state'
import ErrorState from '@/components/ui/error-state'
import { getStudent, updateStudent } from '@/lib/api/school-core'
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'
import type { Student } from '@/lib/api/school-core'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Graduated', value: 'graduated' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Suspended', value: 'suspended' },
]

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [resolvedId, setResolvedId] = useState('')
  const [form, setForm] = useState({
    admission_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    preferred_name: '',
    gender: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    region: '',
    division: '',
    residential_address: '',
    phone: '',
    email: '',
    status: 'active',
    previous_school: '',
    gce_level: '',
    candidate_status: '',
    health_notes: '',
    emergency_contact: '',
  })

  useEffect(() => {
    let cancelled = false
    params.then((p) => {
      if (cancelled) return
      const id = p.id
      setResolvedId(id)
      setLoading(true)
      return getStudent(id)
        .then((result) => {
          if (cancelled) return
          const data = (result as { data: Student }).data
          setForm({
            admission_number: data.admission_number || '',
            first_name: data.first_name || '',
            middle_name: data.middle_name || '',
            last_name: data.last_name || '',
            preferred_name: data.preferred_name || '',
            gender: data.gender || '',
            date_of_birth: data.date_of_birth || '',
            place_of_birth: data.place_of_birth || '',
            nationality: data.nationality || '',
            region: data.region || '',
            division: data.division || '',
            residential_address: data.residential_address || '',
            phone: data.phone || '',
            email: data.email || '',
            status: data.status || 'active',
            previous_school: data.previous_school || '',
            gce_level: data.gce_level || '',
            candidate_status: data.candidate_status || '',
            health_notes: data.health_notes || '',
            emergency_contact: data.emergency_contact || '',
          })
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          if ((err as Error).message.includes('not found')) {
            setNotFound(true)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load student')
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
      await updateStudent(resolvedId, form)
      router.push(`/dashboard/students/${resolvedId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student')
    } finally {
      setSaving(false)
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <ErrorState title="Not found" message="Student not found." onRetry={() => window.location.reload()} />
      </AppShell>
    )
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState message="Loading student..." />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Edit Student"
          description="Update student profile information."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Students', href: '/dashboard/students' },
            { label: 'Edit Student' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Admission Number" name="admission_number" value={form.admission_number} onChange={(v) => update('admission_number', v)} required />
            <FormField label="First Name" name="first_name" value={form.first_name} onChange={(v) => update('first_name', v)} required />
            <FormField label="Middle Name" name="middle_name" value={form.middle_name} onChange={(v) => update('middle_name', v)} />
            <FormField label="Last Name" name="last_name" value={form.last_name} onChange={(v) => update('last_name', v)} required />
            <FormField label="Preferred Name" name="preferred_name" value={form.preferred_name} onChange={(v) => update('preferred_name', v)} />
            <FormField label="Gender" name="gender" value={form.gender} onChange={(v) => update('gender', v)} options={GENDER_OPTIONS} required />
            <FormField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={(v) => update('date_of_birth', v)} />
            <FormField label="Place of Birth" name="place_of_birth" value={form.place_of_birth} onChange={(v) => update('place_of_birth', v)} />
            <FormField label="Nationality" name="nationality" value={form.nationality} onChange={(v) => update('nationality', v)} />
            <FormField label="Region" name="region" value={form.region} onChange={(v) => update('region', v)} />
            <FormField label="Division" name="division" value={form.division} onChange={(v) => update('division', v)} />
            <FormField label="Residential Address" name="residential_address" value={form.residential_address} onChange={(v) => update('residential_address', v)} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={(v) => update('phone', v)} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={(v) => update('email', v)} />
            <FormField label="Status" name="status" value={form.status} onChange={(v) => update('status', v)} options={STATUS_OPTIONS} />
            <FormField label="Previous School" name="previous_school" value={form.previous_school} onChange={(v) => update('previous_school', v)} />
            <FormField label="GCE Level" name="gce_level" value={form.gce_level} onChange={(v) => update('gce_level', v)} />
            <FormField label="Candidate Status" name="candidate_status" value={form.candidate_status} onChange={(v) => update('candidate_status', v)} />
            <FormField label="Health Notes" name="health_notes" value={form.health_notes} onChange={(v) => update('health_notes', v)} rows={3} />
            <FormField label="Emergency Contact" name="emergency_contact" value={form.emergency_contact} onChange={(v) => update('emergency_contact', v)} />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/dashboard/students/${resolvedId}`}
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

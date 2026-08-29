import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, notFound, serverError } from '@/lib/api/error'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const { id } = await context.params
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_record_id', id)
    .maybeSingle()

  if (error) return serverError('Failed to load attendance record')
  if (!data) return notFound('Attendance record not found')

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const { id } = await context.params
  const supabase = await getSupabaseServerClient()
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const allowed = ['present', 'absent', 'late', 'excused']
  const updates: Record<string, unknown> = {}
  if (body.status) {
    if (!allowed.includes(body.status)) return NextResponse.json({ error: 'Invalid attendance status' }, { status: 400 })
    updates.status = body.status
  }
  if ('reason' in body) updates.reason = body.reason ?? null
  if ('notes' in body) updates.notes = body.notes ?? null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_record_id', id)
    .select('*')
    .maybeSingle()

  if (error) return serverError('Failed to update attendance record')
  if (!data) return notFound('Attendance record not found')

  return NextResponse.json({ data })
}

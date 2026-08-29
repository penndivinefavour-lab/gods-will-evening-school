import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, notFound, serverError, badRequest } from '@/lib/api/error'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const { id } = await context.params
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('attendance_worksheets')
    .select('*')
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_worksheet_id', id)
    .maybeSingle()

  if (error) return serverError('Failed to load attendance worksheet')
  if (!data) return notFound('Attendance worksheet not found')

  return NextResponse.json({ data })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const { id } = await context.params
  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid request body')

  const allowedStatuses = ['pending', 'extraction', 'extracted', 'review', 'approved', 'rejected']
  const updates: Record<string, unknown> = {}

  if (body.extraction_status && allowedStatuses.includes(body.extraction_status)) {
    updates.extraction_status = body.extraction_status
  }
  if ('rejection_reason' in body) updates.rejection_reason = body.rejection_reason ?? null
  if ('extraction_result' in body) updates.extraction_result = body.extraction_result ?? null
  if ('reviewed_by' in body) updates.reviewed_by = body.reviewed_by ?? null
  if ('approved_at' in body) updates.approved_at = body.approved_at ?? null
  if ('file_id' in body) updates.file_id = body.file_id ?? null
  if ('worksheet_date' in body) updates.worksheet_date = body.worksheet_date

  if (Object.keys(updates).length === 0) {
    return badRequest('No valid fields to update')
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('attendance_worksheets')
    .update(updates)
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_worksheet_id', id)
    .select('*')
    .maybeSingle()

  if (error) return serverError('Failed to update attendance worksheet')
  if (!data) return notFound('Attendance worksheet not found')

  return NextResponse.json({ data })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const { id } = await context.params
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase
    .from('attendance_worksheets')
    .delete()
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_worksheet_id', id)

  if (error) return serverError('Failed to delete attendance worksheet')
  return NextResponse.json({ deleted: true })
}

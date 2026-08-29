import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, notFound, serverError, badRequest } from '@/lib/api/error'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const roleContext = await requirePermission(request, 'mark_attendance')
  if (!roleContext) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid request body')

  const rejectionReason = typeof body.rejection_reason === 'string' ? body.rejection_reason.trim() : ''
  if (!rejectionReason) return badRequest('rejection_reason is required')

  const { id } = await context.params
  const supabase = await getSupabaseServerClient()

  const { data: worksheet, error: fetchError } = await supabase
    .from('attendance_worksheets')
    .select('*')
    .eq('school_id', roleContext.schoolId as string)
    .eq('attendance_worksheet_id', id)
    .maybeSingle()

  if (fetchError) return serverError('Failed to load attendance worksheet')
  if (!worksheet) return notFound('Attendance worksheet not found')

  const { data: updated, error: updateError } = await supabase
    .from('attendance_worksheets')
    .update({
      extraction_status: 'rejected',
      rejection_reason: rejectionReason,
      reviewed_by: roleContext.userId,
    })
    .eq('attendance_worksheet_id', id)
    .select('*')
    .single()

  if (updateError) return serverError('Failed to reject attendance worksheet')

  return NextResponse.json({ data: updated })
}

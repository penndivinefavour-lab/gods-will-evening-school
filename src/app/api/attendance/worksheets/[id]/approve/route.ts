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

  if (worksheet.extraction_status !== 'extracted') {
    return badRequest('Worksheet must be in extracted state before approval')
  }

  const extractionResult = worksheet.extraction_result as Record<string, unknown> | null
  const extractedRecords = extractionResult?.records as Array<Record<string, unknown>> | undefined

  if (!extractedRecords || extractedRecords.length === 0) {
    return badRequest('No extracted attendance records to approve')
  }

  const approvedRecords: Array<Record<string, unknown>> = []

  for (const record of extractedRecords) {
    const studentId = record.student_id as string | undefined
    const attendanceDate = record.attendance_date as string | undefined
    const status = record.status as string | undefined

    if (!studentId || !attendanceDate || !status) continue

    const allowed = ['present', 'absent', 'late', 'excused']
    if (!allowed.includes(status)) continue

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('attendance_record_id')
      .eq('school_id', worksheet.school_id)
      .eq('student_id', studentId)
      .eq('class_id', worksheet.class_id)
      .eq('attendance_date', attendanceDate)
      .maybeSingle()

    if (existing) continue

    const { data: inserted, error: insertError } = await supabase
      .from('attendance_records')
      .insert({
        school_id: worksheet.school_id,
        student_id: studentId,
        class_id: worksheet.class_id,
        teacher_id: roleContext.userId,
        attendance_worksheet_id: worksheet.attendance_worksheet_id,
        attendance_date: attendanceDate,
        status,
        reason: record.reason ?? null,
        notes: record.notes ?? null,
        academic_year_id: worksheet.academic_year_id,
      })
      .select('attendance_record_id')
      .single()

    if (!insertError && inserted) {
      approvedRecords.push(inserted as unknown as Record<string, unknown>)
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('attendance_worksheets')
    .update({
      extraction_status: 'approved',
      reviewed_by: roleContext.userId,
      approved_at: new Date().toISOString(),
    })
    .eq('attendance_worksheet_id', id)
    .select('*')
    .single()

  if (updateError) return serverError('Failed to approve attendance worksheet')

  return NextResponse.json({ worksheet: updated, approved_records: approvedRecords })
}

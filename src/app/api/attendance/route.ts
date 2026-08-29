import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const studentId = searchParams.get('student_id')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const status = searchParams.get('status')

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('school_id', context.schoolId!)
    .order('attendance_date', { ascending: false })

  if (error) return serverError('Failed to load attendance records')

  let filtered = data ?? []
  if (classId) filtered = filtered.filter((row) => row.class_id === classId)
  if (studentId) filtered = filtered.filter((row) => row.student_id === studentId)
  if (dateFrom) filtered = filtered.filter((row) => row.attendance_date >= dateFrom)
  if (dateTo) filtered = filtered.filter((row) => row.attendance_date <= dateTo)
  if (status) filtered = filtered.filter((row) => row.status === status)

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid request body')

  const { student_id, class_id, attendance_date, status, reason, notes, enrollment_id, academic_year_id } = body ?? {}

  if (!student_id || !class_id || !attendance_date || !status) {
    return badRequest('student_id, class_id, attendance_date and status are required')
  }

  const allowed = ['present', 'absent', 'late', 'excused']
  if (!allowed.includes(status)) {
    return badRequest('Invalid attendance status')
  }

  const supabase = await getSupabaseServerClient()
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('attendance_record_id')
    .eq('school_id', context.schoolId)
    .eq('student_id', student_id)
    .eq('class_id', class_id)
    .eq('attendance_date', attendance_date)
    .maybeSingle()

  if (existing) {
    return badRequest('Attendance already recorded for this student, class and date')
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      school_id: context.schoolId,
      student_id,
      class_id,
      attendance_date,
      status,
      reason: reason ?? null,
      notes: notes ?? null,
      enrollment_id: enrollment_id ?? null,
      academic_year_id: academic_year_id ?? null,
    })
    .select('*')
    .single()

  if (error) return serverError('Failed to create attendance record')

  return NextResponse.json(data, { status: 201 })
}

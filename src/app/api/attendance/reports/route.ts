import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const supabase = await getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const studentId = searchParams.get('student_id')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const status = searchParams.get('status')

  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('school_id', context.schoolId as string)

  if (classId) query = query.eq('class_id', classId)
  if (studentId) query = query.eq('student_id', studentId)
  if (dateFrom) query = query.gte('attendance_date', dateFrom)
  if (dateTo) query = query.lte('attendance_date', dateTo)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return serverError('Failed to load attendance reports')

  const records = data ?? []
  const totals = records.reduce(
    (acc, record) => {
      acc.total += 1
      acc[record.status as keyof typeof acc] += 1
      return acc
    },
    { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
  )

  const attendancePercentage = totals.total > 0 ? ((totals.present + totals.late + totals.excused) / totals.total) * 100 : 0

  return NextResponse.json({
    filters: { class_id: classId, student_id: studentId, date_from: dateFrom, date_to: dateTo, status },
    totals,
    attendance_percentage: Math.round(attendancePercentage * 100) / 100,
    records,
  })
}

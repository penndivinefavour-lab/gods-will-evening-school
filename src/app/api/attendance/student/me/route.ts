import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'view_own_records')
  if (!context || context.role !== 'student') return unauthorized()

  const supabase = await getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const status = searchParams.get('status')

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('student_id')
    .eq('user_id', context.userId)
    .maybeSingle()

  if (studentError) return serverError('Failed to resolve student profile')
  if (!student) return NextResponse.json([])

  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', student.student_id)
    .order('attendance_date', { ascending: false })

  if (dateFrom) query = query.gte('attendance_date', dateFrom)
  if (dateTo) query = query.lte('attendance_date', dateTo)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return serverError('Failed to load attendance records')

  return NextResponse.json(data ?? [])
}

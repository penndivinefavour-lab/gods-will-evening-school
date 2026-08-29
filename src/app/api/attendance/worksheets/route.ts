import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const supabase = await getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const status = searchParams.get('status')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')

  let query = supabase
    .from('attendance_worksheets')
    .select('*')
    .eq('school_id', context.schoolId as string)
    .order('worksheet_date', { ascending: false })

  if (classId) query = query.eq('class_id', classId)
  if (status) query = query.eq('extraction_status', status)
  if (dateFrom) query = query.gte('worksheet_date', dateFrom)
  if (dateTo) query = query.lte('worksheet_date', dateTo)

  const { data, error } = await query

  if (error) return serverError('Failed to load attendance worksheets')
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid request body')

  const { class_id, worksheet_date, file_id, academic_year_id, teacher_id } = body ?? {}
  if (!class_id || !worksheet_date) {
    return badRequest('class_id and worksheet_date are required')
  }

  const supabase = await getSupabaseServerClient()
  const payload: Record<string, unknown> = {
    school_id: context.schoolId,
    class_id,
    worksheet_date,
    extraction_status: 'pending',
  }

  if (file_id) payload.file_id = file_id
  if (academic_year_id) payload.academic_year_id = academic_year_id
  if (teacher_id) payload.teacher_id = teacher_id
  else if (context.role === 'teacher') payload.teacher_id = context.userId

  const { data, error } = await supabase
    .from('attendance_worksheets')
    .insert(payload)
    .select('*')
    .single()

  if (error) return serverError('Failed to create attendance worksheet')
  return NextResponse.json(data, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'view_own_records')
  if (!context || context.role !== 'parent') return unauthorized()

  const supabase = await getSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const status = searchParams.get('status')

  const { data: guardians, error: guardianError } = await supabase
    .from('guardians')
    .select('guardian_id')
    .eq('user_id', context.userId)

  if (guardianError) return serverError('Failed to load guardian profile')

  const guardianIds = (guardians ?? []).map((item: { guardian_id: string }) => item.guardian_id)
  if (guardianIds.length === 0) return NextResponse.json([])

  const { data: links, error: linksError } = await supabase
    .from('student_guardians')
    .select('student_id')
    .in('guardian_id', guardianIds)

  if (linksError) return serverError('Failed to load guardian links')

  const studentIds = (links ?? []).map((item: { student_id: string }) => item.student_id)
  if (studentIds.length === 0) return NextResponse.json([])

  let query = supabase
    .from('attendance_records')
    .select('*')
    .in('student_id', studentIds)
    .order('attendance_date', { ascending: false })

  if (dateFrom) query = query.gte('attendance_date', dateFrom)
  if (dateTo) query = query.lte('attendance_date', dateTo)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return serverError('Failed to load attendance records')

  return NextResponse.json(data ?? [])
}

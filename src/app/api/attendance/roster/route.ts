import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  const context = await requirePermission(request, 'mark_attendance')
  if (!context) return unauthorized()

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  if (!classId) return NextResponse.json({ error: 'class_id is required' }, { status: 400 })

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('enrollment_id, student_id, students(student_id, first_name, last_name, admission_number)')
    .eq('school_id', context.schoolId as string)
    .eq('class_id', classId)
    .order('created_at', { ascending: false })

  if (error) return serverError('Failed to load class roster')

  const roster = (data ?? []).map((row: Record<string, unknown>) => {
    const student = (row.students as Record<string, string> | null) ?? {}
    return {
      enrollment_id: row.enrollment_id,
      student_id: row.student_id,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.admission_number || 'Unknown',
    }
  })

  return NextResponse.json(roster)
}

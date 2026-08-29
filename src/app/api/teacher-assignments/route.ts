import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_teachers')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0
    const teacherId = searchParams.get('teacher_id') || ''
    const classId = searchParams.get('class_id') || ''
    const subjectId = searchParams.get('subject_id') || ''

    let query = supabase
      .from('teacher_assignments')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (teacherId) {
      query = query.eq('teacher_id', teacherId)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return serverError(error.message)
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to list teacher assignments')
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_teachers')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const teacherId = typeof body.teacher_id === 'string' ? body.teacher_id.trim() : ''
    const classId = typeof body.class_id === 'string' ? body.class_id.trim() : ''
    const subjectId = typeof body.subject_id === 'string' ? body.subject_id.trim() : ''

    if (!teacherId || !classId || !subjectId) {
      return badRequest('teacher_id, class_id and subject_id are required')
    }

    const schoolId = roleContext.schoolId as string

    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (teacherError) {
      return serverError(teacherError.message)
    }

    if (!teacher) {
      return badRequest('Teacher not found in this school')
    }

    const { data: existing, error: existingError } = await supabase
      .from('teacher_assignments')
      .select('teacher_assignment_id')
      .eq('teacher_id', teacherId)
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (existing) {
      return badRequest('This teacher is already assigned to this class and subject')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
    }

    const { data, error } = await supabase
      .from('teacher_assignments')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return serverError(error.message)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to create teacher assignment')
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, notFound, serverError } from '@/lib/api/error'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_teachers')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from('teacher_assignments')
      .select('*')
      .eq('teacher_assignment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Teacher assignment not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load teacher assignment')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_teachers')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: existing, error: existingError } = await supabase
      .from('teacher_assignments')
      .select('teacher_id, class_id, subject_id')
      .eq('teacher_assignment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Teacher assignment not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.teacher_id !== undefined) {
      const teacherId = typeof body.teacher_id === 'string' ? body.teacher_id.trim() : ''
      if (!teacherId) {
        return badRequest('teacher_id cannot be empty')
      }

      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('teacher_id', teacherId)
        .eq('school_id', roleContext.schoolId as string)
        .maybeSingle()

      if (teacherError) {
        return serverError(teacherError.message)
      }

      if (!teacher) {
        return badRequest('Teacher not found in this school')
      }

      updates.teacher_id = teacherId
    }

    if (body.class_id !== undefined) {
      const classId = typeof body.class_id === 'string' ? body.class_id.trim() : ''
      if (!classId) {
        return badRequest('class_id cannot be empty')
      }

      const { data: classExists, error: classError } = await supabase
        .from('classes')
        .select('class_id')
        .eq('class_id', classId)
        .eq('school_id', roleContext.schoolId as string)
        .maybeSingle()

      if (classError) {
        return serverError(classError.message)
      }

      if (!classExists) {
        return badRequest('Class not found in this school')
      }

      updates.class_id = classId
    }

    if (body.subject_id !== undefined) {
      const subjectId = typeof body.subject_id === 'string' ? body.subject_id.trim() : ''
      if (!subjectId) {
        return badRequest('subject_id cannot be empty')
      }

      const { data: subjectExists, error: subjectError } = await supabase
        .from('subjects')
        .select('subject_id')
        .eq('subject_id', subjectId)
        .eq('school_id', roleContext.schoolId as string)
        .maybeSingle()

      if (subjectError) {
        return serverError(subjectError.message)
      }

      if (!subjectExists) {
        return badRequest('Subject not found in this school')
      }

      updates.subject_id = subjectId
    }

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('teacher_assignments')
      .update(updates)
      .eq('teacher_assignment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .select('*')
      .single()

    if (error) {
      return serverError(error.message)
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to update teacher assignment')
  }
}

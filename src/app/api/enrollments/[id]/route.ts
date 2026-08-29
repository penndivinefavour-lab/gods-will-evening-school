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
    const roleContext = await requirePermission(request, 'manage_students')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('enrollment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Enrollment not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load enrollment')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_students')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: existing, error: existingError } = await supabase
      .from('enrollments')
      .select('student_id, class_id, academic_year_id')
      .eq('enrollment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Enrollment not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.student_id !== undefined) {
      const studentId = typeof body.student_id === 'string' ? body.student_id.trim() : ''
      if (!studentId) {
        return badRequest('student_id cannot be empty')
      }

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('student_id')
        .eq('student_id', studentId)
        .eq('school_id', roleContext.schoolId as string)
        .maybeSingle()

      if (studentError) {
        return serverError(studentError.message)
      }

      if (!student) {
        return badRequest('Student not found in this school')
      }

      updates.student_id = studentId
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

    if (body.academic_year_id !== undefined) {
      const academicYearId =
        typeof body.academic_year_id === 'string' ? body.academic_year_id.trim() || null : body.academic_year_id

      if (academicYearId !== null) {
        const { data: academicYear, error: academicYearError } = await supabase
          .from('academic_years')
          .select('academic_year_id')
          .eq('academic_year_id', academicYearId)
          .eq('school_id', roleContext.schoolId as string)
          .maybeSingle()

        if (academicYearError) {
          return serverError(academicYearError.message)
        }

        if (!academicYear) {
          return badRequest('Invalid academic_year_id for this school')
        }
      }

      updates.academic_year_id = academicYearId
    }

    if (body.status !== undefined) updates.status = body.status

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('enrollment_id', id)
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
    return serverError('Failed to update enrollment')
  }
}

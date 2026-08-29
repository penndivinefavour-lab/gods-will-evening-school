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
      .from('student_guardians')
      .select('*')
      .eq('student_guardian_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Student guardian relationship not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load student guardian relationship')
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
      .from('student_guardians')
      .select('student_id, guardian_id')
      .eq('student_guardian_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Student guardian relationship not found')
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

    if (body.guardian_id !== undefined) {
      const guardianId = typeof body.guardian_id === 'string' ? body.guardian_id.trim() : ''
      if (!guardianId) {
        return badRequest('guardian_id cannot be empty')
      }

      const { data: guardian, error: guardianError } = await supabase
        .from('guardians')
        .select('guardian_id')
        .eq('guardian_id', guardianId)
        .eq('school_id', roleContext.schoolId as string)
        .maybeSingle()

      if (guardianError) {
        return serverError(guardianError.message)
      }

      if (!guardian) {
        return badRequest('Guardian not found in this school')
      }

      updates.guardian_id = guardianId
    }

    if (body.is_primary !== undefined) updates.is_primary = body.is_primary

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('student_guardians')
      .update(updates)
      .eq('student_guardian_id', id)
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
    return serverError('Failed to update student guardian relationship')
  }
}

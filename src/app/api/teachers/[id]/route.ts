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
      .from('teachers')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Teacher not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load teacher')
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
      .from('teachers')
      .select('staff_id')
      .eq('teacher_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Teacher not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.staff_id !== undefined) {
      const staffId = typeof body.staff_id === 'string' ? body.staff_id.trim() : ''
      if (!staffId) {
        return badRequest('staff_id cannot be empty')
      }

      if (staffId !== existing.staff_id) {
        const { data: duplicate, error: duplicateError } = await supabase
          .from('teachers')
          .select('teacher_id')
          .eq('school_id', roleContext.schoolId as string)
          .eq('staff_id', staffId)
          .neq('teacher_id', id)
          .maybeSingle()

        if (duplicateError) {
          return serverError(duplicateError.message)
        }

        if (duplicate) {
          return badRequest('A teacher with this staff id already exists in this school')
        }
      }

      updates.staff_id = staffId
    }

    if (body.first_name !== undefined) updates.first_name = body.first_name
    if (body.last_name !== undefined) updates.last_name = body.last_name
    if (body.qualifications !== undefined) updates.qualifications = body.qualifications
    if (body.specialization !== undefined) updates.specialization = body.specialization
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.email !== undefined) updates.email = body.email
    if (body.employment_status !== undefined) updates.employment_status = body.employment_status
    if (body.date_joined !== undefined) updates.date_joined = body.date_joined
    if (body.emergency_contact !== undefined) updates.emergency_contact = body.emergency_contact
    if (body.user_id !== undefined) updates.user_id = body.user_id

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('teacher_id', id)
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
    return serverError('Failed to update teacher')
  }
}

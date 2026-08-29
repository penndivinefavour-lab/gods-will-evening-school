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
      .from('students')
      .select('*')
      .eq('student_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Student not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load student')
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
      .from('students')
      .select('school_id, admission_number')
      .eq('student_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Student not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.admission_number !== undefined) {
      const admissionNumber = typeof body.admission_number === 'string' ? body.admission_number.trim() : ''
      if (!admissionNumber) {
        return badRequest('admission_number cannot be empty')
      }

      if (admissionNumber !== existing.admission_number) {
        const { data: duplicate, error: duplicateError } = await supabase
          .from('students')
          .select('student_id')
          .eq('school_id', roleContext.schoolId as string)
          .eq('admission_number', admissionNumber)
          .neq('student_id', id)
          .maybeSingle()

        if (duplicateError) {
          return serverError(duplicateError.message)
        }

        if (duplicate) {
          return badRequest('A student with this admission number already exists in this school')
        }
      }

      updates.admission_number = admissionNumber
    }

    if (body.first_name !== undefined) updates.first_name = body.first_name
    if (body.last_name !== undefined) updates.last_name = body.last_name
    if (body.middle_name !== undefined) updates.middle_name = body.middle_name
    if (body.preferred_name !== undefined) updates.preferred_name = body.preferred_name
    if (body.gender !== undefined) updates.gender = body.gender
    if (body.date_of_birth !== undefined) updates.date_of_birth = body.date_of_birth
    if (body.place_of_birth !== undefined) updates.place_of_birth = body.place_of_birth
    if (body.nationality !== undefined) updates.nationality = body.nationality
    if (body.region !== undefined) updates.region = body.region
    if (body.division !== undefined) updates.division = body.division
    if (body.residential_address !== undefined) updates.residential_address = body.residential_address
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.email !== undefined) updates.email = body.email
    if (body.status !== undefined) updates.status = body.status
    if (body.previous_school !== undefined) updates.previous_school = body.previous_school
    if (body.gce_level !== undefined) updates.gce_level = body.gce_level
    if (body.candidate_status !== undefined) updates.candidate_status = body.candidate_status
    if (body.health_notes !== undefined) updates.health_notes = body.health_notes
    if (body.emergency_contact !== undefined) updates.emergency_contact = body.emergency_contact
    if (body.user_id !== undefined) updates.user_id = body.user_id

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('student_id', id)
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
    return serverError('Failed to update student')
  }
}

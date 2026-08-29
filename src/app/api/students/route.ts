import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_students')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,admission_number.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
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
    return serverError('Failed to list students')
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_students')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const admissionNumber = typeof body.admission_number === 'string' ? body.admission_number.trim() : ''
    const firstName = typeof body.first_name === 'string' ? body.first_name.trim() : ''
    const lastName = typeof body.last_name === 'string' ? body.last_name.trim() : ''
    const gender = typeof body.gender === 'string' ? body.gender.trim() : ''

    if (!admissionNumber || !firstName || !lastName || !gender) {
      return badRequest('admission_number, first_name, last_name and gender are required')
    }

    const schoolId = roleContext.schoolId as string

    const { data: duplicate, error: duplicateError } = await supabase
      .from('students')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('admission_number', admissionNumber)
      .maybeSingle()

    if (duplicateError) {
      return serverError(duplicateError.message)
    }

    if (duplicate) {
      return badRequest('A student with this admission number already exists in this school')
    }

    if (body.user_id && typeof body.user_id === 'string') {
      const { data: existingUser, error: existingUserError } = await supabase
        .from('students')
        .select('student_id')
        .eq('school_id', schoolId)
        .eq('user_id', body.user_id)
        .maybeSingle()

      if (existingUserError) {
        return serverError(existingUserError.message)
      }

      if (existingUser) {
        return badRequest('This user is already linked to a student in this school')
      }
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      admission_number: admissionNumber,
      first_name: firstName,
      last_name: lastName,
      gender,
      status: body.status ?? 'active',
      user_id: body.user_id ?? null,
      middle_name: body.middle_name ?? null,
      preferred_name: body.preferred_name ?? null,
      date_of_birth: body.date_of_birth ?? null,
      place_of_birth: body.place_of_birth ?? null,
      nationality: body.nationality ?? null,
      region: body.region ?? null,
      division: body.division ?? null,
      residential_address: body.residential_address ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      previous_school: body.previous_school ?? null,
      gce_level: body.gce_level ?? null,
      candidate_status: body.candidate_status ?? null,
      health_notes: body.health_notes ?? null,
      emergency_contact: body.emergency_contact ?? null,
    }

    const { data, error } = await supabase
      .from('students')
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
    return serverError('Failed to create student')
  }
}

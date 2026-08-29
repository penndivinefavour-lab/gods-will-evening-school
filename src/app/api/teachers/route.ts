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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('teachers')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,staff_id.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('employment_status', status)
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
    return serverError('Failed to list teachers')
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

    const staffId = typeof body.staff_id === 'string' ? body.staff_id.trim() : ''
    const firstName = typeof body.first_name === 'string' ? body.first_name.trim() : ''
    const lastName = typeof body.last_name === 'string' ? body.last_name.trim() : ''
    const employmentStatus = typeof body.employment_status === 'string' ? body.employment_status.trim() : ''

    if (!staffId || !firstName || !lastName || !employmentStatus) {
      return badRequest('staff_id, first_name, last_name and employment_status are required')
    }

    const schoolId = roleContext.schoolId as string

    const { data: duplicate, error: duplicateError } = await supabase
      .from('teachers')
      .select('teacher_id')
      .eq('school_id', schoolId)
      .eq('staff_id', staffId)
      .maybeSingle()

    if (duplicateError) {
      return serverError(duplicateError.message)
    }

    if (duplicate) {
      return badRequest('A teacher with this staff id already exists in this school')
    }

    if (body.user_id && typeof body.user_id === 'string') {
      const { data: existingUser, error: existingUserError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('school_id', schoolId)
        .eq('user_id', body.user_id)
        .maybeSingle()

      if (existingUserError) {
        return serverError(existingUserError.message)
      }

      if (existingUser) {
        return badRequest('This user is already linked to a teacher in this school')
      }
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      staff_id: staffId,
      first_name: firstName,
      last_name: lastName,
      employment_status: employmentStatus,
      user_id: body.user_id ?? null,
      qualifications: body.qualifications ?? null,
      specialization: body.specialization ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      date_joined: body.date_joined ?? null,
      emergency_contact: body.emergency_contact ?? null,
    }

    const { data, error } = await supabase
      .from('teachers')
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
    return serverError('Failed to create teacher')
  }
}

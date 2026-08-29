import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

const VALID_STATUSES = ['active', 'inactive', 'graduated', 'transferred', 'suspended']

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
    const studentId = searchParams.get('student_id') || ''
    const classId = searchParams.get('class_id') || ''
    const academicYearId = searchParams.get('academic_year_id') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('enrollments')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId)
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
    return serverError('Failed to list enrollments')
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

    const studentId = typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const classId = typeof body.class_id === 'string' ? body.class_id.trim() : ''
    const academicYearId =
      body.academic_year_id && typeof body.academic_year_id === 'string'
        ? body.academic_year_id.trim()
        : null
    const status = typeof body.status === 'string' ? body.status.trim() : ''

    if (!studentId || !classId) {
      return badRequest('student_id and class_id are required')
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`)
    }

    const schoolId = roleContext.schoolId as string

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (studentError) {
      return serverError(studentError.message)
    }

    if (!student) {
      return badRequest('Student not found in this school')
    }

    const { data: classExists, error: classError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('class_id', classId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (classError) {
      return serverError(classError.message)
    }

    if (!classExists) {
      return badRequest('Class not found in this school')
    }

    if (academicYearId) {
      const { data: academicYear, error: academicYearError } = await supabase
        .from('academic_years')
        .select('academic_year_id')
        .eq('academic_year_id', academicYearId)
        .eq('school_id', schoolId)
        .maybeSingle()

      if (academicYearError) {
        return serverError(academicYearError.message)
      }

      if (!academicYear) {
        return badRequest('Invalid academic_year_id for this school')
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from('enrollments')
      .select('enrollment_id')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .eq('academic_year_id', academicYearId)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (existing) {
      return badRequest('This student is already enrolled in this class for the selected academic year')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      status: status || 'active',
    }

    const { data, error } = await supabase
      .from('enrollments')
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
    return serverError('Failed to create enrollment')
  }
}

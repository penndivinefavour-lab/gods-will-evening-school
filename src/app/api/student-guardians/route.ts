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
    const studentId = searchParams.get('student_id') || ''
    const guardianId = searchParams.get('guardian_id') || ''

    let query = supabase
      .from('student_guardians')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (guardianId) {
      query = query.eq('guardian_id', guardianId)
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
    return serverError('Failed to list student guardians')
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
    const guardianId = typeof body.guardian_id === 'string' ? body.guardian_id.trim() : ''
    const isPrimary = body.is_primary === true

    if (!studentId || !guardianId) {
      return badRequest('student_id and guardian_id are required')
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

    const { data: guardian, error: guardianError } = await supabase
      .from('guardians')
      .select('guardian_id')
      .eq('guardian_id', guardianId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (guardianError) {
      return serverError(guardianError.message)
    }

    if (!guardian) {
      return badRequest('Guardian not found in this school')
    }

    const { data: existing, error: existingError } = await supabase
      .from('student_guardians')
      .select('student_guardian_id')
      .eq('student_id', studentId)
      .eq('guardian_id', guardianId)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (existing) {
      return badRequest('This guardian is already linked to this student')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      student_id: studentId,
      guardian_id: guardianId,
      is_primary: isPrimary,
    }

    const { data, error } = await supabase
      .from('student_guardians')
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
    return serverError('Failed to create student guardian relationship')
  }
}

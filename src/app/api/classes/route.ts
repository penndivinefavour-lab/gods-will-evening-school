import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_classes')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const academicYearId = searchParams.get('academic_year_id') || ''

    let query = supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,stream.ilike.%${search}%,display_name.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId)
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
    return serverError('Failed to list classes')
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_classes')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const status = typeof body.status === 'string' ? body.status.trim() : ''

    if (!name || !status) {
      return badRequest('name and status are required')
    }

    const schoolId = roleContext.schoolId as string
    const academicYearId =
      body.academic_year_id && typeof body.academic_year_id === 'string'
        ? body.academic_year_id.trim()
        : null

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

    const { data: duplicate, error: duplicateError } = await supabase
      .from('classes')
      .select('class_id')
      .eq('school_id', schoolId)
      .eq('name', name)
      .eq('academic_year_id', academicYearId)
      .maybeSingle()

    if (duplicateError) {
      return serverError(duplicateError.message)
    }

    if (duplicate) {
      return badRequest('A class with this name already exists for the selected academic year in this school')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      name,
      status,
      academic_year_id: academicYearId,
      stream: body.stream ?? null,
      display_name: body.display_name ?? null,
      capacity: body.capacity ?? null,
    }

    const { data, error } = await supabase
      .from('classes')
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
    return serverError('Failed to create class')
  }
}

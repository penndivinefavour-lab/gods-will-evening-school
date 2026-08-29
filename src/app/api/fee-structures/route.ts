import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_fees')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0
    const search = searchParams.get('search') || ''
    const academicYearId = searchParams.get('academic_year_id') || ''
    const classId = searchParams.get('class_id') || ''

    let query = supabase
      .from('fee_structures')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId)
    }

    if (classId) {
      query = query.eq('class_id', classId)
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
    return serverError('Failed to list fee structures')
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_fees')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return badRequest('name is required')
    }

    const schoolId = roleContext.schoolId as string

    if (body.class_id && typeof body.class_id === 'string') {
      const { data: classExists, error: classError } = await supabase
        .from('classes')
        .select('class_id')
        .eq('class_id', body.class_id)
        .eq('school_id', schoolId)
        .maybeSingle()

      if (classError) {
        return serverError(classError.message)
      }

      if (!classExists) {
        return badRequest('class_id does not belong to this school')
      }
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      name,
      description: body.description ?? null,
      academic_year_id: body.academic_year_id ?? null,
      class_id: body.class_id ?? null,
      amount: body.amount ?? 0,
      currency: body.currency ?? 'XAF',
      frequency: body.frequency ?? 'one_time',
      is_active: body.is_active ?? true,
    }

    const { data, error } = await supabase
      .from('fee_structures')
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
    return serverError('Failed to create fee structure')
  }
}

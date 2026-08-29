import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { requirePermission } from '@/lib/api/auth'
import { badRequest, unauthorized, serverError } from '@/lib/api/error'

export async function GET(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_subjects')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const offset = Number(searchParams.get('offset')) || 0
    const search = searchParams.get('search') || ''
    const activeParam = searchParams.get('active')

    let query = supabase
      .from('subjects')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
    }

    if (activeParam === 'true') {
      query = query.eq('active', true)
    } else if (activeParam === 'false') {
      query = query.eq('active', false)
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
    return serverError('Failed to list subjects')
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleContext = await requirePermission(request, 'manage_subjects')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const code = typeof body.code === 'string' ? body.code.trim() : ''

    if (!name || !code) {
      return badRequest('name and code are required')
    }

    const schoolId = roleContext.schoolId as string

    const { data: duplicate, error: duplicateError } = await supabase
      .from('subjects')
      .select('subject_id')
      .eq('school_id', schoolId)
      .eq('code', code)
      .maybeSingle()

    if (duplicateError) {
      return serverError(duplicateError.message)
    }

    if (duplicate) {
      return badRequest('A subject with this code already exists in this school')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      name,
      code,
      description: body.description ?? null,
      active: body.active ?? true,
    }

    const { data, error } = await supabase
      .from('subjects')
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
    return serverError('Failed to create subject')
  }
}

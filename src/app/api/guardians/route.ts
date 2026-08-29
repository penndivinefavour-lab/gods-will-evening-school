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

    let query = supabase
      .from('guardians')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
      )
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
    return serverError('Failed to list guardians')
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

    const firstName = typeof body.first_name === 'string' ? body.first_name.trim() : ''
    const lastName = typeof body.last_name === 'string' ? body.last_name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!firstName || !lastName || !phone) {
      return badRequest('first_name, last_name and phone are required')
    }

    const schoolId = roleContext.schoolId as string

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      first_name: firstName,
      last_name: lastName,
      phone,
      user_id: body.user_id ?? null,
      relationship: body.relationship ?? null,
      alternative_phone: body.alternative_phone ?? null,
      email: body.email ?? null,
      occupation: body.occupation ?? null,
      address: body.address ?? null,
      emergency_contact: body.emergency_contact ?? false,
    }

    const { data, error } = await supabase
      .from('guardians')
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
    return serverError('Failed to create guardian')
  }
}

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
    const roleContext = await requirePermission(request, 'manage_fees')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from('fee_structures')
      .select('*')
      .eq('fee_structure_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Fee structure not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load fee structure')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_fees')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: existing, error: existingError } = await supabase
      .from('fee_structures')
      .select('fee_structure_id')
      .eq('fee_structure_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Fee structure not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return badRequest('name cannot be empty')
      }
      updates.name = name
    }

    if (body.description !== undefined) updates.description = body.description
    if (body.academic_year_id !== undefined) updates.academic_year_id = body.academic_year_id
    if (body.class_id !== undefined) updates.class_id = body.class_id
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount < 0) {
        return badRequest('amount must be a non-negative number')
      }
      updates.amount = amount
    }
    if (body.currency !== undefined) updates.currency = body.currency
    if (body.frequency !== undefined) updates.frequency = body.frequency
    if (body.is_active !== undefined) updates.is_active = body.is_active

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('fee_structures')
      .update(updates)
      .eq('fee_structure_id', id)
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
    return serverError('Failed to update fee structure')
  }
}

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
      .from('payments')
      .select('*')
      .eq('payment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Payment not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load payment')
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
      .from('payments')
      .select('payment_id')
      .eq('payment_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Payment not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.status !== undefined) {
      const status = typeof body.status === 'string' ? body.status.trim() : ''
      if (!['pending', 'confirmed', 'failed', 'cancelled', 'refunded'].includes(status)) {
        return badRequest('status must be one of: pending, confirmed, failed, cancelled, refunded')
      }
      updates.status = status
    }

    if (body.reference !== undefined) updates.reference = body.reference
    if (body.method !== undefined) updates.method = body.method
    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        return badRequest('amount must be a positive number')
      }
      updates.amount = amount
    }

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('payment_id', id)
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
    return serverError('Failed to update payment')
  }
}

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
      .from('invoices')
      .select('*')
      .eq('invoice_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Invoice not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load invoice')
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
      .from('invoices')
      .select('invoice_id')
      .eq('invoice_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Invoice not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.status !== undefined) {
      const status = typeof body.status === 'string' ? body.status.trim() : ''
      if (!['draft', 'issued', 'paid', 'void', 'overdue'].includes(status)) {
        return badRequest('status must be one of: draft, issued, paid, void, overdue')
      }
      updates.status = status
    }

    if (body.amount !== undefined) {
      const amount = Number(body.amount)
      if (!Number.isFinite(amount) || amount < 0) {
        return badRequest('amount must be a non-negative number')
      }
      updates.amount = amount
    }

    if (body.fee_structure_id !== undefined) updates.fee_structure_id = body.fee_structure_id

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('invoice_id', id)
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
    return serverError('Failed to update invoice')
  }
}

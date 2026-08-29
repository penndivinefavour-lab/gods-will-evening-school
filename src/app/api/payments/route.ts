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
    const invoiceId = searchParams.get('invoice_id') || ''
    const method = searchParams.get('method') || ''

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId)
    }

    if (method) {
      query = query.eq('method', method)
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
    return serverError('Failed to list payments')
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

    const invoiceId = typeof body.invoice_id === 'string' ? body.invoice_id.trim() : ''
    const method = typeof body.method === 'string' ? body.method.trim() : ''
    const amount = Number(body.amount)
    const reference = typeof body.reference === 'string' ? body.reference.trim() : ''
    const status = typeof body.status === 'string' ? body.status.trim() : 'confirmed'

    if (!invoiceId || !method) {
      return badRequest('invoice_id and method are required')
    }

    if (!['mtn_momo', 'orange_money', 'bank_transfer', 'manual_cash', 'manual_transfer'].includes(method)) {
      return badRequest('method must be one of: mtn_momo, orange_money, bank_transfer, manual_cash, manual_transfer')
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return badRequest('amount must be a positive number')
    }

    const schoolId = roleContext.schoolId as string

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('invoice_id, amount, status')
      .eq('invoice_id', invoiceId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (invoiceError) {
      return serverError(invoiceError.message)
    }

    if (!invoice) {
      return badRequest('Invoice not found in this school')
    }

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('school_id', schoolId)

    if (paymentsError) {
      return serverError(paymentsError.message)
    }

    const paidAmount = (payments ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
    const invoiceAmount = Number(invoice.amount ?? 0)

    if (paidAmount + amount > invoiceAmount) {
      return badRequest('Payment would exceed the invoice balance')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      invoice_id: invoiceId,
      amount,
      method,
      reference: reference || null,
      status: ['pending', 'confirmed', 'failed', 'cancelled', 'refunded'].includes(status) ? status : 'confirmed',
    }

    const { data, error } = await supabase
      .from('payments')
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
    return serverError('Failed to create payment')
  }
}

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
    const paymentId = searchParams.get('payment_id') || ''
    const studentId = searchParams.get('student_id') || ''

    let query = supabase
      .from('receipts')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (paymentId) {
      query = query.eq('payment_id', paymentId)
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
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
    return serverError('Failed to list receipts')
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

    const paymentId = typeof body.payment_id === 'string' ? body.payment_id.trim() : ''
    const invoiceId = typeof body.invoice_id === 'string' ? body.invoice_id.trim() : ''
    const studentId = typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const receiptNumber = typeof body.receipt_number === 'string' ? body.receipt_number.trim() : ''
    const amount = Number(body.amount)
    const method = typeof body.method === 'string' ? body.method.trim() : ''
    const paidBy = typeof body.paid_by === 'string' ? body.paid_by.trim() : ''
    const paidAt = typeof body.paid_at === 'string' ? body.paid_at.trim() : ''

    if (!paymentId || !invoiceId || !studentId) {
      return badRequest('payment_id, invoice_id and student_id are required')
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return badRequest('amount must be a positive number')
    }

    const schoolId = roleContext.schoolId as string

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('payment_id')
      .eq('payment_id', paymentId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (paymentError) {
      return serverError(paymentError.message)
    }

    if (!payment) {
      return badRequest('Payment not found in this school')
    }

    const { data: existingReceipt, error: receiptError } = await supabase
      .from('receipts')
      .select('receipt_id')
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (receiptError) {
      return serverError(receiptError.message)
    }

    if (existingReceipt) {
      return badRequest('A receipt already exists for this payment')
    }

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      payment_id: paymentId,
      invoice_id: invoiceId,
      student_id: studentId,
      receipt_number: receiptNumber || null,
      amount,
      method: method || null,
      paid_by: paidBy || null,
      paid_at: paidAt || null,
    }

    const { data, error } = await supabase
      .from('receipts')
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
    return serverError('Failed to create receipt')
  }
}

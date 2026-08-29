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
    const studentId = searchParams.get('student_id') || ''
    const feeStructureId = searchParams.get('fee_structure_id') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('school_id', roleContext.schoolId as string)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (feeStructureId) {
      query = query.eq('fee_structure_id', feeStructureId)
    }

    if (status) {
      query = query.eq('status', status)
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
    return serverError('Failed to list invoices')
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

    const studentId = typeof body.student_id === 'string' ? body.student_id.trim() : ''
    const feeStructureId = typeof body.fee_structure_id === 'string' ? body.fee_structure_id.trim() : ''
    const amount = body.amount !== undefined ? Number(body.amount) : null
    const status = typeof body.status === 'string' ? body.status.trim() : 'draft'

    if (!studentId || !feeStructureId) {
      return badRequest('student_id and fee_structure_id are required')
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

    const { data: feeStructure, error: feeError } = await supabase
      .from('fee_structures')
      .select('fee_structure_id, amount')
      .eq('fee_structure_id', feeStructureId)
      .eq('school_id', schoolId)
      .maybeSingle()

    if (feeError) {
      return serverError(feeError.message)
    }

    if (!feeStructure) {
      return badRequest('Fee structure not found in this school')
    }

    const invoiceAmount =
      amount !== null && Number.isFinite(amount) ? amount : Number(feeStructure.amount ?? 0)

    const payload: Record<string, unknown> = {
      school_id: schoolId,
      student_id: studentId,
      fee_structure_id: feeStructureId,
      amount: invoiceAmount,
      status: ['draft', 'issued', 'paid', 'void', 'overdue'].includes(status) ? status : 'draft',
    }

    const { data, error } = await supabase
      .from('invoices')
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
    return serverError('Failed to create invoice')
  }
}

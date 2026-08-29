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
    const roleContext = await requirePermission(request, 'manage_subjects')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subject_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Subject not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load subject')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_subjects')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: existing, error: existingError } = await supabase
      .from('subjects')
      .select('code')
      .eq('subject_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Subject not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.code !== undefined) {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      if (!code) {
        return badRequest('code cannot be empty')
      }

      if (code !== existing.code) {
        const { data: duplicate, error: duplicateError } = await supabase
          .from('subjects')
          .select('subject_id')
          .eq('school_id', roleContext.schoolId as string)
          .eq('code', code)
          .neq('subject_id', id)
          .maybeSingle()

        if (duplicateError) {
          return serverError(duplicateError.message)
        }

        if (duplicate) {
          return badRequest('A subject with this code already exists in this school')
        }
      }

      updates.code = code
    }

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.active !== undefined) updates.active = body.active

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('subject_id', id)
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
    return serverError('Failed to update subject')
  }
}

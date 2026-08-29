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
    const roleContext = await requirePermission(request, 'manage_classes')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (error) {
      return serverError(error.message)
    }

    if (!data) {
      return notFound('Class not found')
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return serverError('Failed to load class')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const roleContext = await requirePermission(request, 'manage_classes')
    if (!roleContext) {
      return unauthorized()
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data: existing, error: existingError } = await supabase
      .from('classes')
      .select('name, academic_year_id')
      .eq('class_id', id)
      .eq('school_id', roleContext.schoolId as string)
      .maybeSingle()

    if (existingError) {
      return serverError(existingError.message)
    }

    if (!existing) {
      return notFound('Class not found')
    }

    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return badRequest('name cannot be empty')
      }

      const targetAcademicYearId =
        body.academic_year_id !== undefined
          ? typeof body.academic_year_id === 'string'
            ? body.academic_year_id.trim() || null
            : existing.academic_year_id
          : existing.academic_year_id

      if (name !== existing.name || targetAcademicYearId !== existing.academic_year_id) {
        const { data: duplicate, error: duplicateError } = await supabase
          .from('classes')
          .select('class_id')
          .eq('school_id', roleContext.schoolId as string)
          .eq('name', name)
          .eq('academic_year_id', targetAcademicYearId)
          .neq('class_id', id)
          .maybeSingle()

        if (duplicateError) {
          return serverError(duplicateError.message)
        }

        if (duplicate) {
          return badRequest('A class with this name already exists for the selected academic year in this school')
        }
      }

      updates.name = name
    }

    if (body.academic_year_id !== undefined) {
      const academicYearId =
        typeof body.academic_year_id === 'string' ? body.academic_year_id.trim() || null : body.academic_year_id

      if (academicYearId !== null) {
        const { data: academicYear, error: academicYearError } = await supabase
          .from('academic_years')
          .select('academic_year_id')
          .eq('academic_year_id', academicYearId)
          .eq('school_id', roleContext.schoolId as string)
          .maybeSingle()

        if (academicYearError) {
          return serverError(academicYearError.message)
        }

        if (!academicYear) {
          return badRequest('Invalid academic_year_id for this school')
        }
      }

      updates.academic_year_id = academicYearId
    }

    if (body.stream !== undefined) updates.stream = body.stream
    if (body.display_name !== undefined) updates.display_name = body.display_name
    if (body.capacity !== undefined) updates.capacity = body.capacity
    if (body.status !== undefined) updates.status = body.status

    if (!Object.keys(updates).length) {
      return badRequest('No updatable fields provided')
    }

    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('class_id', id)
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
    return serverError('Failed to update class')
  }
}

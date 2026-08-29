import { NextRequest } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/auth'

export type RoleContext = {
  userId: string
  role: 'platform_technical_administrator' | 'school_administrator' | 'teacher' | 'student' | 'parent'
  schoolId: string | null
}

export async function getRoleContext(): Promise<RoleContext | null> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id, school_id, roles(name)')
    .eq('user_id', user.id)
    .single()

  if (!userRole) {
    return {
      userId: user.id,
      role: 'platform_technical_administrator',
      schoolId: null,
    }
  }

  return {
    userId: user.id,
    role: ((userRole.roles as { name: string }[])[0]?.name ??
      'platform_technical_administrator') as RoleContext['role'],
    schoolId: userRole.school_id,
  }
}

export async function requirePermission(_request: NextRequest, permission: string): Promise<RoleContext | null> {
  const context = await getRoleContext()

  if (!context) {
    return null
  }

  if (!hasPermission(context.role, permission) && context.role !== 'platform_technical_administrator') {
    return null
  }

  return context
}

import { getSupabaseServerClient } from '@/lib/supabase-server'
import { UserRole } from '@/types/auth'

export type SchoolContext = {
  schoolId: string | null
  role: UserRole
}

export async function getUserRoleContext(): Promise<SchoolContext | null> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role_id, school_id, roles(name)')
    .eq('user_id', user.id)
    .single()

  if (error || !userRole) return null

  return {
    schoolId: userRole.school_id,
    role: (userRole.roles as { name: string }[])[0]?.name as UserRole
  }
}

export function hasPermission(userRole: UserRole, requiredPermission: string): boolean {
  const permissionMap: Record<UserRole, string[]> = {
    platform_technical_administrator: ['*'],
    school_administrator: ['view_audit_logs', 'manage_branding', 'manage_students', 'manage_teachers', 'manage_classes', 'manage_fees', 'manage_examinations', 'manage_timetable', 'manage_report_cards', 'manage_announcements', 'mark_attendance', 'enter_marks', 'view_own_records'],
    teacher: ['manage_examinations', 'manage_timetable', 'manage_report_cards', 'manage_announcements', 'mark_attendance', 'enter_marks', 'view_own_records'],
    student: ['view_own_records'],
    parent: ['view_own_records', 'view_linked_child_records', 'communicate_with_teachers']
  }

  const permissions = permissionMap[userRole] || []
  return permissions.includes('*') || permissions.includes(requiredPermission)
}

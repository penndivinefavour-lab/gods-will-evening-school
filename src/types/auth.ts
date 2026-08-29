import type { Database } from './database.types'

export type Tables = Database['public']['Tables']
export type UserRole = 'platform_technical_administrator' | 'school_administrator' | 'teacher' | 'student' | 'parent'

export interface AuthSessionUser {
  id: string
  email: string
  role: UserRole
  schoolId?: string
}

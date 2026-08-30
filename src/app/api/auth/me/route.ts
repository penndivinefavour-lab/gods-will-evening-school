import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { getUserRoleContext } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  const roleContext = await getUserRoleContext()
  
  return NextResponse.json({
    userId: user?.id ?? null,
    authError: authError?.message ?? null,
    roleContext: roleContext ? {
      schoolId: roleContext.schoolId,
      role: roleContext.role
    } : null,
    cookies: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
  }, { status: user ? 200 : 401 })
}

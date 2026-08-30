import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient()

  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out failed', error)
  }

  return NextResponse.redirect(new URL('/login', request.url), 302)
}

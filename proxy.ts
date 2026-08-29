import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/technical']

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix))

  const supabase = await getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const sessionToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value

  if (isProtectedRoute && !session && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

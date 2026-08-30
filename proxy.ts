import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          )
        },
      },
    }
  )

  // Refresh the session and copy cookies to the response
  await supabase.auth.getUser()

  // Route-guard: protect dashboard, admin, technical routes
  const path = request.nextUrl.pathname
  const isProtectedRoute = ['/dashboard', '/admin', '/technical'].some(
    prefix => path.startsWith(prefix)
  )

  const { data: { session } } = await supabase.auth.getSession()
  const sessionToken = request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  if (isProtectedRoute && !session && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

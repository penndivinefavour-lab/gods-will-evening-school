import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Authenticate the session - validates/refreshes the auth cookies
  // This is the Supabase SSR pattern for Next.js middleware
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Skip Next.js static/media paths and favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
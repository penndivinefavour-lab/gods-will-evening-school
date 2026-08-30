import type { Metadata } from 'next'
import { BRANDING_DEFAULTS } from '@/config/branding'
import { AuthProvider } from '@/components/auth/auth-provider'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${BRANDING_DEFAULTS.name} Management System`,
    template: `%s | ${BRANDING_DEFAULTS.name}`,
  },
  description: BRANDING_DEFAULTS.description,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let supabaseSession = null
  try {
    const supabase = await getSupabaseServerClient()
    supabaseSession = await supabase.auth.getSession()
  } catch {
    // If Supabase isn't configured, render without auth session data.
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider initialSession={supabaseSession}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

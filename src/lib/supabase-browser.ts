import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  try {
    return createBrowserClient(url, anonKey)
  } catch (cause) {
    throw new Error(
      `Failed to create Supabase client: ${cause instanceof Error ? cause.message : String(cause)}`
    )
  }
}

'use client'

import { createBrowserClient } from '@supabase/ssr'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Session = Awaited<ReturnType<typeof createBrowserClient.prototype.auth.getSession>>

interface AuthContextValue {
  session: Session | null
  user: Awaited<ReturnType<typeof createBrowserClient.prototype.auth.getUser>>['data']['user'] | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession?: Session
}) {
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      return
    }

    const client = createBrowserClient(url, anonKey)

    let cancelled = false
    let mounted = true

    const onSessionReady = () => {
      if (!mounted || cancelled) return
      setLoading(false)
    }

    const applySession = async () => {
      try {
        const { data: sessionData } = await client.auth.getSession()
        if (!mounted || cancelled) return
        setSession(sessionData)

        const { data: userData } = await client.auth.getUser()
        if (!mounted || cancelled) return
        setUser(userData.user)
      } finally {
        onSessionReady()
      }
    }

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, sessionData) => {
        if (cancelled || !mounted) return
        setSession(sessionData)
        const { data: userData } = await client.auth.getUser()
        if (mounted) setUser(userData.user)
      }
    )

    applySession()

    return () => {
      cancelled = true
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
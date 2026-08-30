'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Wait for the browser auth client to settle its session before routing.
      // The SSR browser client updates the session cookie asynchronously, so
      // poll for the session before navigating to the dashboard.
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Sign in did not complete in time')), 8000)
        supabase.auth.getSession().then(({ data: { session } }) => {
          clearTimeout(timer)
          if (!session) reject(new Error('Sign in succeeded but no session was established'))
          else resolve()
        }).catch((cause) => {
          clearTimeout(timer)
          reject(cause instanceof Error ? cause : new Error(String(cause)))
        })
      })

      // Verify the server-recognized session with a same-origin API probe,
      // then route to the dashboard only after the probe succeeds.
      try {
        const probe = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Accept': 'application/json' },
        })
        if (!probe.ok) {
          setError(`Sign in succeeded locally but the server did not recognize the session yet (probe status ${probe.status}). Please retry signing in.`)
          return
        }
        router.push('/dashboard')
        router.refresh()
      } catch (probeFailure) {
        setError(`Sign in succeeded locally but the server probe failed: ${probeFailure instanceof Error ? probeFailure.message : 'probe failed'}`)
        return
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unexpected login error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      color: '#1e293b',
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '24rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sign in</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Use your platform or school account.
        </p>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '0.4rem',
              border: '1px solid #cbd5e1',
              fontSize: '1rem',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '0.4rem',
              border: '1px solid #cbd5e1',
              fontSize: '1rem',
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: '0.7rem 1rem',
            borderRadius: '0.4rem',
            border: 'none',
            backgroundColor: '#1A2744',
            color: '#ffffff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <a href="/signup" style={{ color: '#1A2744' }}>Create account</a>
          <a href="/reset-password" style={{ color: '#1A2744' }}>Reset password</a>
        </div>
      </form>
    </div>
  )
}

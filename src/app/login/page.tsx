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

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Unexpected login error')
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

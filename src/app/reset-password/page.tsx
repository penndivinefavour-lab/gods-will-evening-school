'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setMessage('If an account exists, a reset link has been sent.')
    } catch {
      setError('Unexpected error while requesting password reset.')
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reset password</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Enter your account email to receive a reset link.
        </p>

        {error && <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>}
        {message && <p style={{ color: '#16a34a', fontSize: '0.9rem' }}>{message}</p>}

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
          Send reset link
        </button>

        <a href="/login" style={{ color: '#1A2744', fontSize: '0.9rem' }}>
          Back to sign in
        </a>
      </form>
    </div>
  )
}

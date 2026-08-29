'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setMessage('Account created. You can sign in now.')
      router.push('/login')
      router.refresh()
    } catch {
      setError('Unexpected error during sign up.')
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create account</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Create a new platform or school account.
        </p>

        {error && <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>}
        {message && <p style={{ color: '#16a34a', fontSize: '0.9rem' }}>{message}</p>}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
          Full name
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
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
          Create account
        </button>

        <a href="/login" style={{ color: '#1A2744', fontSize: '0.9rem' }}>
          Already have an account? Sign in
        </a>
      </form>
    </div>
  )
}

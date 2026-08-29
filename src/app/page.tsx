import { BRANDING_DEFAULTS } from '@/config/branding'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BRANDING_DEFAULTS.colors.background,
      color: BRANDING_DEFAULTS.colors.text,
      fontFamily: BRANDING_DEFAULTS.typography.fontFamily,
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '640px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          marginBottom: '1rem',
          color: BRANDING_DEFAULTS.colors.primary,
        }}>
          {BRANDING_DEFAULTS.name}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: BRANDING_DEFAULTS.colors.muted,
          marginBottom: '2rem',
        }}>
          Management System — Phase 0 Foundation
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <a
            href="/login"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: BRANDING_DEFAULTS.colors.primary,
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${BRANDING_DEFAULTS.colors.primary}`,
              color: BRANDING_DEFAULTS.colors.primary,
              fontWeight: 600,
            }}
          >
            Create account
          </a>
          <a
            href="/reset-password"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${BRANDING_DEFAULTS.colors.primary}`,
              color: BRANDING_DEFAULTS.colors.primary,
              fontWeight: 600,
            }}
          >
            Reset password
          </a>
        </div>
      </div>
    </main>
  )
}

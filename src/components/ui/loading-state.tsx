'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'

interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2"
        style={{
          borderColor: BRANDING_DEFAULTS.colors.surface,
          borderTopColor: BRANDING_DEFAULTS.colors.primary,
        }}
      />
      <p className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
        {message}
      </p>
    </div>
  )
}

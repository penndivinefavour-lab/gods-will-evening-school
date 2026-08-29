'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'

interface ErrorStateProps {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border py-12 text-center"
      style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
    >
      <p className="text-base font-semibold" style={{ color: '#991b1b' }}>
        {title}
      </p>
      <p className="max-w-sm text-sm" style={{ color: '#b91c1c' }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

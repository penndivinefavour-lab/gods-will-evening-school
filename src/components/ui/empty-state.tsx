'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center"
      style={{ borderColor: '#cbd5e1' }}
    >
      <p className="text-base font-semibold" style={{ color: BRANDING_DEFAULTS.colors.text }}>
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: BRANDING_DEFAULTS.colors.primary }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

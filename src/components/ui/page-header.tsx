'use client'

import { BRANDING_DEFAULTS } from '@/config/branding'

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: React.ReactNode
}

export default function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-2 text-xs" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="font-medium" style={{ color: BRANDING_DEFAULTS.colors.text }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-bold md:text-2xl" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

export const BRANDING_DEFAULTS = {
  name: 'God\'s Will Evening School',
  shortName: 'GWES',
  description: 'Evening Secondary Education',
  colors: {
    primary: '#1A2744',
    accent: '#F5C518',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    muted: '#64748B',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
} as const

export type BrandingConfig = typeof BRANDING_DEFAULTS

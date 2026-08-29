import type { Metadata } from 'next'
import { BRANDING_DEFAULTS } from '@/config/branding'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${BRANDING_DEFAULTS.name} Management System`,
    template: `%s | ${BRANDING_DEFAULTS.name}`,
  },
  description: BRANDING_DEFAULTS.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

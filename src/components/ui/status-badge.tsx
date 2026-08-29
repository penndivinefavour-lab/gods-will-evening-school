'use client'

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: '#dcfce7', text: '#166534' },
  inactive: { bg: '#f1f5f9', text: '#475569' },
  graduated: { bg: '#dbeafe', text: '#1e40af' },
  transferred: { bg: '#fef9c3', text: '#854d0e' },
  suspended: { bg: '#fee2e2', text: '#991b1b' },
  enrolled: { bg: '#dcfce7', text: '#166534' },
  pending: { bg: '#fef9c3', text: '#854d0e' },
  withdrawn: { bg: '#fee2e2', text: '#991b1b' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
  full_time: { bg: '#e0e7ff', text: '#3730a3' },
  part_time: { bg: '#fce7f3', text: '#9d174d' },
  contract: { bg: '#ccfbf1', text: '#115e59' },
}

export function getStatusStyle(status: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, '_')
  return STATUS_STYLES[normalized] || { bg: '#f1f5f9', text: '#475569' }
}

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  )
}

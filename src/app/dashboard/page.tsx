 
import Link from 'next/link'
import { BRANDING_DEFAULTS } from '@/config/branding'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: BRANDING_DEFAULTS.colors.primary }}>
          School Administrator Dashboard
        </h1>
        <p style={{ color: BRANDING_DEFAULTS.colors.muted }}>
          Operational overview, students, teachers, classes, subjects and enrollment.
        </p>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ color: BRANDING_DEFAULTS.colors.text }}
      >
        {[
          { title: 'Students', href: '/dashboard/students', icon: '🎓', description: 'Manage student profiles and records' },
          { title: 'Guardians', href: '/dashboard/guardians', icon: '👨‍👩‍👧', description: 'Guardian contacts and relationships' },
          { title: 'Teachers', href: '/dashboard/teachers', icon: '🧑‍🏫', description: 'Staff profiles and employment' },
          { title: 'Classes', href: '/dashboard/classes', icon: '🏫', description: 'Class setup and capacity' },
          { title: 'Subjects', href: '/dashboard/subjects', icon: '📚', description: 'Subject catalog and status' },
          { title: 'Teacher Assignments', href: '/dashboard/teacher-assignments', icon: '📋', description: 'Assign teachers to classes and subjects' },
          { title: 'Enrollments', href: '/dashboard/enrollments', icon: '📝', description: 'Student enrollment management' },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:border-gray-300"
            style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-semibold">{item.title}</span>
            <span className="text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
              {item.description}
            </span>
          </Link>
        ))}
      </div>

      <div
        className="rounded-lg border p-5"
        style={{ borderColor: '#e2e8f0', backgroundColor: BRANDING_DEFAULTS.colors.surface }}
      >
        <div className="font-semibold" style={{ color: BRANDING_DEFAULTS.colors.text }}>
          Phase 2 School Core
        </div>
        <p className="mt-1 text-sm" style={{ color: BRANDING_DEFAULTS.colors.muted }}>
          Use the cards above to navigate to each management section. All data is school-scoped and requires the appropriate role permissions.
        </p>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  DollarSign,
  UserCog,
  BedDouble,
  BarChart3,
  Heart,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/sesiones', label: 'Sesiones', icon: Calendar },
  { href: '/medicamentos', label: 'Medicamentos', icon: Pill },
  { href: '/habitaciones', label: 'Habitaciones', icon: BedDouble },
  { href: '/finanzas', label: 'Finanzas', icon: DollarSign },
  { href: '/personal', label: 'Personal', icon: UserCog },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)', width: '260px', minHeight: '100vh' }}
      className="flex flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }}>
            <Heart size={20} color="white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Centro Rehab</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>Sistema ERP</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                    color: isActive ? '#93c5fd' : '#cbd5e1',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-800">
        <div className="text-xs" style={{ color: '#64748b' }}>
          <div>ERP Clínica v1.0</div>
          <div>© 2026 Centro Rehab</div>
        </div>
      </div>
    </aside>
  )
}

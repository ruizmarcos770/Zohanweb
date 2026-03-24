'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, User } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/pacientes': 'Pacientes',
  '/sesiones': 'Sesiones de Terapia',
  '/medicamentos': 'Medicamentos',
  '/habitaciones': 'Habitaciones',
  '/finanzas': 'Finanzas',
  '/personal': 'Personal',
  '/reportes': 'Reportes',
}

export default function Header() {
  const pathname = usePathname()

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (path === '/' ? pathname === '/' : pathname.startsWith(path)) {
        return title
      }
    }
    return 'ERP Clínica'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{getTitle()}</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell size={20} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={16} color="white" />
          </div>
          <div className="hidden md:block text-sm">
            <div className="font-medium text-gray-700">Sofía Torres</div>
            <div className="text-xs text-gray-400">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  )
}

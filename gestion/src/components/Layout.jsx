import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'inventario', label: 'Inventario', icon: '📦' },
  { id: 'ventas', label: 'Ventas', icon: '🛒' },
  { id: 'vendedores', label: 'Vendedores', icon: '👤' },
  { id: 'comisiones', label: 'Comisiones', icon: '💰' },
  { id: 'gastos', label: 'Gastos', icon: '💸' },
  { id: 'reportes', label: 'Reportes', icon: '📈' },
]

export default function Layout({ page, setPage, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-56 bg-gray-900 text-white flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-700">
          <span className="text-xl font-bold tracking-tight">Gestión</span>
          <span className="text-blue-400 text-xl font-bold">Pro</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                ${page === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
          Datos guardados localmente
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-800">
            {NAV_ITEMS.find(n => n.id === page)?.label}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

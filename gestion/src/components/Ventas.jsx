import { useState } from 'react'
import { useApp, formatCurrency, formatDate, METODOS_PAGO } from '../context/AppContext'
import NuevaVenta from './NuevaVenta'

const metodoBadge = {
  efectivo: 'bg-green-100 text-green-700',
  tarjeta_debito: 'bg-blue-100 text-blue-700',
  tarjeta_credito: 'bg-purple-100 text-purple-700',
  transferencia: 'bg-yellow-100 text-yellow-700',
}

export default function Ventas() {
  const { state, dispatch } = useApp()
  const [showNueva, setShowNueva] = useState(false)
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(null)

  const ventas = state.ventas
    .filter(v => {
      if (filtroMetodo && v.metodoPago !== filtroMetodo) return false
      if (filtroFechaDesde && new Date(v.fecha) < new Date(filtroFechaDesde)) return false
      if (filtroFechaHasta && new Date(v.fecha) > new Date(filtroFechaHasta + 'T23:59:59')) return false
      return true
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const ventasActivas = ventas.filter(v => v.estado !== 'cancelada')
  const totalFiltrado = ventasActivas.reduce((s, v) => s + v.total, 0)

  const handleCancel = (id) => {
    dispatch({ type: 'CANCEL_VENTA', payload: id })
    setConfirmCancel(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-sm text-gray-500">
            {ventasActivas.length} venta{ventasActivas.length !== 1 ? 's' : ''} · {formatCurrency(totalFiltrado)}
          </p>
        </div>
        <button
          onClick={() => setShowNueva(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Nueva venta
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filtroMetodo}
          onChange={e => setFiltroMetodo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los pagos</option>
          {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input
          type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(filtroMetodo || filtroFechaDesde || filtroFechaHasta) && (
          <button
            onClick={() => { setFiltroMetodo(''); setFiltroFechaDesde(''); setFiltroFechaHasta('') }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Limpiar ×
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {ventas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🛒</div>
            <p>No hay ventas registradas</p>
            <button onClick={() => setShowNueva(true)} className="mt-2 text-sm text-blue-600 hover:underline">
              Registrar primera venta →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">N°</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Vendedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pago</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventas.map(v => {
                  const vendedor = state.vendedores.find(ven => ven.id === v.vendedorId)
                  const cancelada = v.estado === 'cancelada'
                  return (
                    <tr key={v.id} className={`hover:bg-gray-50 ${cancelada ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">#{v.numero}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(v.fecha)}</td>
                      <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">
                        {v.clienteNombre || <span className="text-gray-400">Consumidor final</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {vendedor?.nombre || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cancelada ? 'bg-red-100 text-red-600' : (metodoBadge[v.metodoPago] || 'bg-gray-100 text-gray-600')}`}>
                          {cancelada ? 'Cancelada' : (METODOS_PAGO.find(m => m.value === v.metodoPago)?.label || v.metodoPago)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(v.total)}
                      </td>
                      <td className="px-4 py-3">
                        {!cancelada && (
                          <button
                            onClick={() => setConfirmCancel(v.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNueva && (
        <NuevaVenta onClose={() => setShowNueva(false)} onVentaCreada={() => {}} />
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Cancelar venta</h3>
            <p className="text-sm text-gray-600 mb-4">¿Estás seguro? Se repondrá el stock de los productos.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancel(null)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">
                No, mantener
              </button>
              <button onClick={() => handleCancel(confirmCancel)}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

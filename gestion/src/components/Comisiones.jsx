import { useState } from 'react'
import { useApp, formatCurrency, formatDate } from '../context/AppContext'

export default function Comisiones() {
  const { state, dispatch } = useApp()
  const [filtroVendedor, setFiltroVendedor] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('') // '' | 'pendiente' | 'pagada'
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')

  // Armar lista de comisiones desde ventas
  const comisiones = state.ventas
    .filter(v => {
      if (v.estado === 'cancelada') return false
      if (!v.vendedorId) return false
      if (filtroVendedor && v.vendedorId !== filtroVendedor) return false
      if (filtroEstado === 'pendiente' && v.comisionPagada) return false
      if (filtroEstado === 'pagada' && !v.comisionPagada) return false
      if (filtroFechaDesde && new Date(v.fecha) < new Date(filtroFechaDesde)) return false
      if (filtroFechaHasta && new Date(v.fecha) > new Date(filtroFechaHasta + 'T23:59:59')) return false
      return true
    })
    .map(v => ({
      ventaId: v.id,
      numero: v.numero,
      fecha: v.fecha,
      vendedorId: v.vendedorId,
      vendedorNombre: state.vendedores.find(ven => ven.id === v.vendedorId)?.nombre || '(eliminado)',
      totalVenta: v.total,
      porcentaje: state.vendedores.find(ven => ven.id === v.vendedorId)?.comision || 0,
      monto: v.comisionMonto || 0,
      pagada: v.comisionPagada || false,
      fechaPago: v.comisionFechaPago,
    }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const totalPendiente = comisiones.filter(c => !c.pagada).reduce((s, c) => s + c.monto, 0)
  const totalPagado = comisiones.filter(c => c.pagada).reduce((s, c) => s + c.monto, 0)

  // Resumen por vendedor (sin filtros)
  const resumenPorVendedor = state.vendedores.map(v => {
    const ventasV = state.ventas.filter(ven =>
      ven.vendedorId === v.id && ven.estado !== 'cancelada'
    )
    const pendiente = ventasV.filter(ven => !ven.comisionPagada).reduce((s, ven) => s + (ven.comisionMonto || 0), 0)
    const pagado = ventasV.filter(ven => ven.comisionPagada).reduce((s, ven) => s + (ven.comisionMonto || 0), 0)
    return { ...v, pendiente, pagado }
  }).filter(v => v.pendiente > 0 || v.pagado > 0)

  const marcarPagada = (ventaId) => {
    dispatch({ type: 'PAGAR_COMISION', payload: ventaId })
  }

  const marcarTodas = (vendedorId) => {
    state.ventas
      .filter(v => v.vendedorId === vendedorId && !v.comisionPagada && v.estado !== 'cancelada')
      .forEach(v => dispatch({ type: 'PAGAR_COMISION', payload: v.id }))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comisiones</h1>
        <p className="text-sm text-gray-500">
          Pendiente: <span className="text-orange-600 font-semibold">{formatCurrency(totalPendiente)}</span>
          &nbsp;·&nbsp;
          Pagado: <span className="text-green-600 font-semibold">{formatCurrency(totalPagado)}</span>
        </p>
      </div>

      {/* Resumen por vendedor */}
      {resumenPorVendedor.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resumenPorVendedor.map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{v.nombre}</span>
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{v.comision}%</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <div>
                  <div className="text-xs text-gray-500">Pendiente</div>
                  <div className="font-bold text-orange-600">{formatCurrency(v.pendiente)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Pagado</div>
                  <div className="font-bold text-green-600">{formatCurrency(v.pagado)}</div>
                </div>
              </div>
              {v.pendiente > 0 && (
                <button
                  onClick={() => marcarTodas(v.id)}
                  className="w-full text-xs bg-green-600 text-white rounded-lg py-1.5 hover:bg-green-700 font-medium"
                >
                  Marcar todo como pagado
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filtroVendedor}
          onChange={e => setFiltroVendedor(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los vendedores</option>
          {state.vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
        </select>
        <input
          type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla detalle */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {comisiones.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">💰</div>
            <p>No hay comisiones para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Venta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Total venta</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden md:table-cell">%</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Comisión</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comisiones.map(c => (
                  <tr key={c.ventaId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-gray-600">#{c.numero}</div>
                      <div className="text-xs text-gray-400">{formatDate(c.fecha)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.vendedorNombre}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">{formatCurrency(c.totalVenta)}</td>
                    <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">{c.porcentaje}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-700">{formatCurrency(c.monto)}</td>
                    <td className="px-4 py-3 text-center">
                      {c.pagada ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Pagada</span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!c.pagada && (
                        <button
                          onClick={() => marcarPagada(c.ventaId)}
                          className="text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap"
                        >
                          Marcar pagada
                        </button>
                      )}
                      {c.pagada && c.fechaPago && (
                        <span className="text-xs text-gray-400">{formatDate(c.fechaPago)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

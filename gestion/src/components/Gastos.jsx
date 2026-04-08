import { useState } from 'react'
import { useApp, newId, formatCurrency, formatDate, METODOS_PAGO, CATEGORIAS_GASTO } from '../context/AppContext'

const metodoBadge = {
  efectivo: 'bg-green-100 text-green-700',
  tarjeta_debito: 'bg-blue-100 text-blue-700',
  tarjeta_credito: 'bg-purple-100 text-purple-700',
  transferencia: 'bg-yellow-100 text-yellow-700',
}

const EMPTY = {
  descripcion: '', categoria: 'Otros', monto: '', metodoPago: 'efectivo',
  fecha: new Date().toISOString().split('T')[0], notas: '',
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function GastoForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, monto: parseFloat(form.monto) || 0 })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción *</label>
        <input required value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
          <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Monto *</label>
          <input required type="number" min="0" step="0.01" value={form.monto}
            onChange={e => set('monto', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
          <select value={form.metodoPago} onChange={e => set('metodoPago', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
          <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
        <textarea rows={2} value={form.notas} onChange={e => set('notas', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          Guardar
        </button>
      </div>
    </form>
  )
}

export default function Gastos() {
  const { state, dispatch } = useApp()
  const [modal, setModal] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const gastos = state.gastos
    .filter(g => {
      if (filtroCategoria && g.categoria !== filtroCategoria) return false
      if (filtroMetodo && g.metodoPago !== filtroMetodo) return false
      if (filtroFechaDesde && new Date(g.fecha) < new Date(filtroFechaDesde)) return false
      if (filtroFechaHasta && new Date(g.fecha) > new Date(filtroFechaHasta + 'T23:59:59')) return false
      return true
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const totalFiltrado = gastos.reduce((s, g) => s + g.monto, 0)

  // Resumen por método de pago (global)
  const porMetodo = state.gastos.reduce((acc, g) => {
    acc[g.metodoPago] = (acc[g.metodoPago] || 0) + g.monto
    return acc
  }, {})

  // Resumen por categoría (filtrado)
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {})

  const handleSave = (form) => {
    if (modal === 'nuevo') {
      dispatch({ type: 'ADD_GASTO', payload: { ...form, id: newId() } })
    } else {
      dispatch({ type: 'UPDATE_GASTO', payload: { ...modal, ...form } })
    }
    setModal(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
          <p className="text-sm text-gray-500">
            {gastos.length} gasto{gastos.length !== 1 ? 's' : ''} · {formatCurrency(totalFiltrado)}
          </p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Nuevo gasto
        </button>
      </div>

      {/* Resumen rápido por método */}
      {Object.keys(porMetodo).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {METODOS_PAGO.map(m => {
            if (!porMetodo[m.value]) return null
            return (
              <div key={m.value} className={`rounded-xl border p-3 ${metodoBadge[m.value]} border-current/20`}>
                <div className="text-xs font-medium opacity-80">{m.label}</div>
                <div className="text-lg font-bold mt-0.5">{formatCurrency(porMetodo[m.value])}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las categorías</option>
          {CATEGORIAS_GASTO.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los pagos</option>
          {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <input type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {(filtroCategoria || filtroMetodo || filtroFechaDesde || filtroFechaHasta) && (
          <button onClick={() => { setFiltroCategoria(''); setFiltroMetodo(''); setFiltroFechaDesde(''); setFiltroFechaHasta('') }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2">Limpiar ×</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {gastos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">💸</div>
              <p>No hay gastos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Categoría</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Método</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Fecha</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gastos.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{g.descripcion}</div>
                        {g.notas && <div className="text-xs text-gray-400 truncate max-w-xs">{g.notas}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{g.categoria}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${metodoBadge[g.metodoPago] || 'bg-gray-100 text-gray-600'}`}>
                          {METODOS_PAGO.find(m => m.value === g.metodoPago)?.label || g.metodoPago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(g.fecha)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(g.monto)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setModal({ ...g, monto: g.monto.toString(), fecha: g.fecha.split('T')[0] })}
                            className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                          <button onClick={() => setConfirmDelete(g.id)}
                            className="text-xs text-red-400 hover:text-red-600">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen por categoría */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Por categoría</h3>
          {Object.keys(porCategoria).length === 0 ? (
            <p className="text-xs text-gray-400">Sin datos</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(porCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, total]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">{cat}</span>
                    <span className="font-medium text-gray-800 whitespace-nowrap">{formatCurrency(total)}</span>
                  </div>
                ))}
              <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalFiltrado)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'nuevo' ? 'Nuevo gasto' : 'Editar gasto'}
          onClose={() => setModal(null)}
        >
          <GastoForm
            initial={modal === 'nuevo' ? EMPTY : modal}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirmar eliminación" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">¿Eliminar este gasto?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={() => { dispatch({ type: 'DELETE_GASTO', payload: confirmDelete }); setConfirmDelete(null) }}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700">Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

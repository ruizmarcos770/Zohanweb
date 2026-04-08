import { useState } from 'react'
import { useApp, newId, formatCurrency } from '../context/AppContext'

const EMPTY = { nombre: '', email: '', telefono: '', comision: '' }

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

function VendedorForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, comision: parseFloat(form.comision) || 0 })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
        <input required value={form.nombre} onChange={e => set('nombre', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
        <input value={form.telefono} onChange={e => set('telefono', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">% Comisión sobre ventas *</label>
        <input required type="number" min="0" max="100" step="0.1"
          value={form.comision} onChange={e => set('comision', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

export default function Vendedores() {
  const { state, dispatch } = useApp()
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleSave = (form) => {
    if (modal === 'nuevo') {
      dispatch({ type: 'ADD_VENDEDOR', payload: { ...form, id: newId() } })
    } else {
      dispatch({ type: 'UPDATE_VENDEDOR', payload: { ...modal, ...form } })
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_VENDEDOR', payload: id })
    setConfirmDelete(null)
  }

  // Stats por vendedor
  const statsVendedor = (vendedorId) => {
    const ventasV = state.ventas.filter(v => v.vendedorId === vendedorId && v.estado !== 'cancelada')
    const totalVentas = ventasV.reduce((s, v) => s + v.total, 0)
    const totalComisiones = ventasV.reduce((s, v) => s + (v.comisionMonto || 0), 0)
    const comisionesPendientes = ventasV
      .filter(v => !v.comisionPagada)
      .reduce((s, v) => s + (v.comisionMonto || 0), 0)
    return { totalVentas, totalComisiones, comisionesPendientes, cantVentas: ventasV.length }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendedores</h1>
          <p className="text-sm text-gray-500">{state.vendedores.length} vendedor{state.vendedores.length !== 1 ? 'es' : ''}</p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Nuevo vendedor
        </button>
      </div>

      {state.vendedores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400">
          <div className="text-4xl mb-2">👤</div>
          <p>No hay vendedores cargados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.vendedores.map(v => {
            const stats = statsVendedor(v.id)
            return (
              <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{v.nombre}</h3>
                    {v.email && <p className="text-xs text-gray-400 mt-0.5">{v.email}</p>}
                    {v.telefono && <p className="text-xs text-gray-400">{v.telefono}</p>}
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-2.5 py-1 rounded-full">
                    {v.comision}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-blue-600 font-medium">Ventas</div>
                    <div className="text-sm font-bold text-blue-700">{stats.cantVentas}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-green-600 font-medium">Total</div>
                    <div className="text-xs font-bold text-green-700">{formatCurrency(stats.totalVentas)}</div>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${stats.comisionesPendientes > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-medium ${stats.comisionesPendientes > 0 ? 'text-orange-600' : 'text-gray-500'}`}>Pendiente</div>
                    <div className={`text-xs font-bold ${stats.comisionesPendientes > 0 ? 'text-orange-700' : 'text-gray-400'}`}>
                      {formatCurrency(stats.comisionesPendientes)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ ...v, comision: v.comision.toString() })}
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-1.5 text-xs hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(v.id)}
                    className="flex-1 border border-red-200 text-red-500 rounded-lg py-1.5 text-xs hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'nuevo' ? 'Nuevo vendedor' : 'Editar vendedor'}
          onClose={() => setModal(null)}
        >
          <VendedorForm
            initial={modal === 'nuevo' ? EMPTY : { nombre: modal.nombre, email: modal.email, telefono: modal.telefono, comision: modal.comision }}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirmar eliminación" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">¿Eliminar este vendedor? Sus ventas se mantendrán.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(null)}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={() => handleDelete(confirmDelete)}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700">Eliminar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

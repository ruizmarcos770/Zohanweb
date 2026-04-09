import { useState } from 'react'
import { useApp, newId, formatCurrency } from '../context/AppContext'
import SelectConNueva from './SelectConNueva'

const EMPTY = {
  codigo: '', nombre: '', descripcion: '',
  precioCompra: '', precioVenta: '', stock: '', stockMinimo: '',
  categoria: '',
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

function ProductoForm({ initial, categorias, onAddCategoria, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      precioCompra: parseFloat(form.precioCompra) || 0,
      precioVenta: parseFloat(form.precioVenta) || 0,
      stock: parseInt(form.stock) || 0,
      stockMinimo: parseInt(form.stockMinimo) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Código</label>
          <input value={form.codigo} onChange={e => set('codigo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
          <SelectConNueva
            value={form.categoria}
            onChange={v => set('categoria', v)}
            options={categorias}
            onAddOption={onAddCategoria}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
        <input required value={form.nombre} onChange={e => set('nombre', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
        <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Precio compra</label>
          <input type="number" min="0" step="0.01" value={form.precioCompra} onChange={e => set('precioCompra', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Precio venta *</label>
          <input required type="number" min="0" step="0.01" value={form.precioVenta} onChange={e => set('precioVenta', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock actual *</label>
          <input required type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock mínimo</label>
          <input type="number" min="0" value={form.stockMinimo} onChange={e => set('stockMinimo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
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

export default function Inventario() {
  const { state, dispatch } = useApp()
  const [modal, setModal] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const categorias = state.categoriasProducto || []

  const productos = state.productos.filter(p => {
    const q = busqueda.toLowerCase()
    const matchBusq = !q || p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    const matchCat = !filtroCategoria || p.categoria === filtroCategoria
    return matchBusq && matchCat
  })

  const handleSave = (form) => {
    if (modal === 'nuevo') {
      dispatch({ type: 'ADD_PRODUCTO', payload: { ...form, id: newId() } })
    } else {
      dispatch({ type: 'UPDATE_PRODUCTO', payload: { ...modal, ...form } })
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_PRODUCTO', payload: id })
    setConfirmDelete(null)
  }

  const stockBajoCount = state.productos.filter(p => p.stock <= p.stockMinimo).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500">{state.productos.length} producto{state.productos.length !== 1 ? 's' : ''}
            {stockBajoCount > 0 && <span className="ml-2 text-red-500">· {stockBajoCount} con stock bajo</span>}
          </p>
        </div>
        <button
          onClick={() => setModal('nuevo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {productos.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <p>No hay productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">P. Compra</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">P. Venta</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 hidden md:table-cell"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map(p => {
                  const bajo = p.stock <= p.stockMinimo
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{p.nombre}</div>
                        <div className="text-xs text-gray-400">{p.codigo} · {p.categoria}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 hidden sm:table-cell">
                        {formatCurrency(p.precioCompra)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(p.precioVenta)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${bajo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {p.stock} u.
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setModal(p)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                          <button onClick={() => setConfirmDelete(p.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
          onClose={() => setModal(null)}
        >
          <ProductoForm
            categorias={categorias}
            onAddCategoria={cat => dispatch({ type: 'ADD_CATEGORIA_PRODUCTO', payload: cat })}
            initial={modal === 'nuevo' ? { ...EMPTY, categoria: categorias[0] || '' } : {
              ...modal,
              precioCompra: modal.precioCompra.toString(),
              precioVenta: modal.precioVenta.toString(),
              stock: modal.stock.toString(),
              stockMinimo: modal.stockMinimo.toString(),
            }}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirmar eliminación" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-gray-600 mb-4">¿Estás seguro de que querés eliminar este producto?</p>
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

import { useState, useRef } from 'react'
import { useApp, newId, formatCurrency, METODOS_PAGO } from '../context/AppContext'

function Comprobante({ venta, vendedor, onClose }) {
  const printRef = useRef()

  const handlePrint = () => window.print()

  const metodoPagoLabel = METODOS_PAGO.find(m => m.value === venta.metodoPago)?.label || venta.metodoPago

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b no-print">
          <h2 className="font-semibold text-gray-800">Comprobante de Venta</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
            >
              🖨️ Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
        </div>

        {/* Comprobante body */}
        <div ref={printRef} className="p-6 print-area">
          <div className="text-center mb-5 border-b pb-4">
            <div className="text-xl font-bold text-gray-900">COMPROBANTE DE VENTA</div>
            <div className="text-sm text-gray-500">N° {venta.numero}</div>
            <div className="text-sm text-gray-500">{new Date(venta.fecha).toLocaleString('es-AR')}</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Cliente:</span>
              <div className="font-medium">{venta.clienteNombre || 'Consumidor final'}</div>
            </div>
            <div>
              <span className="text-gray-500">Vendedor:</span>
              <div className="font-medium">{vendedor?.nombre || '—'}</div>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 font-medium text-gray-600">Producto</th>
                <th className="text-center py-1 font-medium text-gray-600">Cant.</th>
                <th className="text-right py-1 font-medium text-gray-600">P. Unit.</th>
                <th className="text-right py-1 font-medium text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-800">{item.nombre}</td>
                  <td className="py-1.5 text-center text-gray-600">{item.cantidad}</td>
                  <td className="py-1.5 text-right text-gray-600">{formatCurrency(item.precioUnitario)}</td>
                  <td className="py-1.5 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="space-y-1 text-sm border-t pt-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(venta.subtotal)}</span>
            </div>
            {venta.descuento > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatCurrency(venta.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-1 mt-1">
              <span>TOTAL</span>
              <span>{formatCurrency(venta.total)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs pt-1">
              <span>Método de pago</span>
              <span>{metodoPagoLabel}</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t">
            Gracias por su compra
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NuevaVenta({ onClose, onVentaCreada }) {
  const { state, dispatch } = useApp()
  const [clienteNombre, setClienteNombre] = useState('')
  const [vendedorId, setVendedorId] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [descuento, setDescuento] = useState(0)
  const [items, setItems] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [ventaCreada, setVentaCreada] = useState(null)
  const [error, setError] = useState('')

  const productosFiltrados = state.productos.filter(p => {
    if (!busqueda) return false
    const q = busqueda.toLowerCase()
    return (p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)) && p.stock > 0
  })

  const agregarItem = (producto) => {
    setItems(prev => {
      const existente = prev.find(i => i.productoId === producto.id)
      if (existente) {
        if (existente.cantidad >= producto.stock) return prev
        return prev.map(i => i.productoId === producto.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precioUnitario }
          : i)
      }
      return [...prev, {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subtotal: producto.precioVenta,
        stockDisponible: producto.stock,
      }]
    })
    setBusqueda('')
  }

  const cambiarCantidad = (productoId, val) => {
    const item = items.find(i => i.productoId === productoId)
    const cant = Math.max(1, Math.min(parseInt(val) || 1, item.stockDisponible))
    setItems(prev => prev.map(i => i.productoId === productoId
      ? { ...i, cantidad: cant, subtotal: cant * i.precioUnitario }
      : i))
  }

  const cambiarPrecio = (productoId, val) => {
    const precio = parseFloat(val) || 0
    setItems(prev => prev.map(i => i.productoId === productoId
      ? { ...i, precioUnitario: precio, subtotal: i.cantidad * precio }
      : i))
  }

  const quitarItem = (productoId) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId))
  }

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const total = Math.max(0, subtotal - (parseFloat(descuento) || 0))

  const vendedor = state.vendedores.find(v => v.id === vendedorId)
  const comisionMonto = vendedor ? total * (vendedor.comision / 100) : 0

  const handleSubmit = () => {
    if (items.length === 0) { setError('Agregá al menos un producto.'); return }
    setError('')

    const numero = String(Date.now()).slice(-6)
    const venta = {
      id: newId(),
      numero,
      fecha: new Date().toISOString(),
      clienteNombre,
      vendedorId,
      items,
      subtotal,
      descuento: parseFloat(descuento) || 0,
      total,
      metodoPago,
      comisionMonto,
      comisionPagada: false,
      comisionFechaPago: null,
      estado: 'completada',
    }
    dispatch({ type: 'ADD_VENTA', payload: venta })
    setVentaCreada(venta)
    onVentaCreada?.()
  }

  if (ventaCreada) {
    return (
      <Comprobante
        venta={ventaCreada}
        vendedor={vendedor}
        onClose={() => { setVentaCreada(null); onClose() }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800 text-lg">Nueva Venta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Cliente y vendedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
              <input
                placeholder="Nombre del cliente"
                value={clienteNombre}
                onChange={e => setClienteNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
              <select
                value={vendedorId}
                onChange={e => setVendedorId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                {state.vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre} ({v.comision}%)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscar producto */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Agregar producto</label>
            <div className="relative">
              <input
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {productosFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {productosFiltrados.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => agregarItem(p)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      <div className="text-left">
                        <div className="font-medium text-gray-800">{p.nombre}</div>
                        <div className="text-xs text-gray-400">{p.codigo} · Stock: {p.stock}</div>
                      </div>
                      <div className="font-medium text-blue-600 ml-2">{formatCurrency(p.precioVenta)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Producto</th>
                    <th className="text-center px-2 py-2 font-medium text-gray-600 w-20">Cant.</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Precio</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.productoId}>
                      <td className="px-3 py-2 text-gray-800">{item.nombre}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number" min="1" max={item.stockDisponible}
                          value={item.cantidad}
                          onChange={e => cambiarCantidad(item.productoId, e.target.value)}
                          className="w-full text-center border border-gray-300 rounded px-1 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number" min="0" step="0.01"
                          value={item.precioUnitario}
                          onChange={e => cambiarPrecio(item.productoId, e.target.value)}
                          className="w-24 text-right border border-gray-300 rounded px-1 py-1 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      <td className="px-2 py-2">
                        <button onClick={() => quitarItem(item.productoId)} className="text-red-400 hover:text-red-600">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Descuento + método de pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descuento ($)</label>
              <input
                type="number" min="0" value={descuento}
                onChange={e => setDescuento(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
              <select
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            {parseFloat(descuento) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span><span>-{formatCurrency(parseFloat(descuento))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
              <span>TOTAL</span><span>{formatCurrency(total)}</span>
            </div>
            {vendedor && (
              <div className="flex justify-between text-purple-600 text-xs">
                <span>Comisión {vendedor.nombre} ({vendedor.comision}%)</span>
                <span>{formatCurrency(comisionMonto)}</span>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex gap-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit}
            className="flex-2 flex-grow-[2] bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700">
            Confirmar venta
          </button>
        </div>
      </div>
    </div>
  )
}

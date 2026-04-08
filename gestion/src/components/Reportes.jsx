import { useState } from 'react'
import { useApp, formatCurrency, METODOS_PAGO } from '../context/AppContext'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function Reportes() {
  const { state } = useApp()
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())

  const ventasMes = state.ventas.filter(v => {
    const d = new Date(v.fecha)
    return v.estado !== 'cancelada' && d.getMonth() === mes && d.getFullYear() === anio
  })
  const gastosMes = state.gastos.filter(g => {
    const d = new Date(g.fecha)
    return d.getMonth() === mes && d.getFullYear() === anio
  })

  const totalVentas = ventasMes.reduce((s, v) => s + v.total, 0)
  const totalGastos = gastosMes.reduce((s, g) => s + g.monto, 0)
  const resultado = totalVentas - totalGastos
  const totalComisiones = ventasMes.reduce((s, v) => s + (v.comisionMonto || 0), 0)

  // Ventas por método de pago
  const ventasPorMetodo = ventasMes.reduce((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] || 0) + v.total
    return acc
  }, {})

  // Gastos por método de pago
  const gastosPorMetodo = gastosMes.reduce((acc, g) => {
    acc[g.metodoPago] = (acc[g.metodoPago] || 0) + g.monto
    return acc
  }, {})

  // Gastos por categoría
  const gastosPorCategoria = gastosMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {})

  // Ventas por vendedor
  const ventasPorVendedor = state.vendedores.map(v => {
    const vs = ventasMes.filter(ven => ven.vendedorId === v.id)
    return {
      nombre: v.nombre,
      cantVentas: vs.length,
      total: vs.reduce((s, ven) => s + ven.total, 0),
      comision: vs.reduce((s, ven) => s + (ven.comisionMonto || 0), 0),
    }
  }).filter(v => v.cantVentas > 0)

  // Evolución mensual (últimos 6 meses)
  const ultimos6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anio, mes - (5 - i), 1)
    const m = d.getMonth()
    const a = d.getFullYear()
    const ventas = state.ventas
      .filter(v => v.estado !== 'cancelada' && new Date(v.fecha).getMonth() === m && new Date(v.fecha).getFullYear() === a)
      .reduce((s, v) => s + v.total, 0)
    const gastos = state.gastos
      .filter(g => new Date(g.fecha).getMonth() === m && new Date(g.fecha).getFullYear() === a)
      .reduce((s, g) => s + g.monto, 0)
    return { label: MESES[m].slice(0, 3) + ' ' + a, ventas, gastos }
  })

  const maxEvol = Math.max(...ultimos6.map(m => Math.max(m.ventas, m.gastos)), 1)

  // Productos más vendidos este mes
  const productoVentas = {}
  ventasMes.forEach(v => {
    v.items.forEach(item => {
      if (!productoVentas[item.productoId]) {
        productoVentas[item.productoId] = { nombre: item.nombre, cantidad: 0, total: 0 }
      }
      productoVentas[item.productoId].cantidad += item.cantidad
      productoVentas[item.productoId].total += item.subtotal
    })
  })
  const topProductos = Object.values(productoVentas).sort((a, b) => b.total - a.total).slice(0, 5)

  const anios = [anio - 1, anio, anio + 1].filter(a => a >= 2020)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <div className="flex gap-2">
          <select value={mes} onChange={e => setMes(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={anio} onChange={e => setAnio(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {anios.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Ingresos', value: totalVentas, color: 'text-blue-700 bg-blue-50 border-blue-200', icon: '📈' },
          { label: 'Gastos', value: totalGastos, color: 'text-red-700 bg-red-50 border-red-200', icon: '📉' },
          { label: 'Resultado', value: resultado, color: resultado >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200', icon: resultado >= 0 ? '✅' : '⚠️' },
          { label: 'Comisiones', value: totalComisiones, color: 'text-purple-700 bg-purple-50 border-purple-200', icon: '💰' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium opacity-80">{label}</span>
              <span>{icon}</span>
            </div>
            <div className="text-xl font-bold">{formatCurrency(value)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolución mensual */}
        <Section title="Evolución mensual (6 meses)">
          <div className="space-y-2">
            {ultimos6.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                  <span>{m.label}</span>
                  <span className="text-green-600">+{formatCurrency(m.ventas)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 bg-blue-400 rounded" style={{ width: `${(m.ventas / maxEvol) * 100}%`, minWidth: m.ventas > 0 ? '2px' : '0' }} />
                </div>
                {m.gastos > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-3 bg-red-300 rounded" style={{ width: `${(m.gastos / maxEvol) * 100}%`, minWidth: '2px' }} />
                    <span className="text-xs text-red-500">{formatCurrency(m.gastos)}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded inline-block" /> Ventas</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-300 rounded inline-block" /> Gastos</span>
            </div>
          </div>
        </Section>

        {/* Ventas por método de pago */}
        <Section title="Ingresos por método de pago">
          {Object.keys(ventasPorMetodo).length === 0 ? (
            <p className="text-sm text-gray-400">Sin ventas este período</p>
          ) : (
            <div className="space-y-3">
              {METODOS_PAGO.map(m => {
                const val = ventasPorMetodo[m.value] || 0
                if (!val) return null
                const pct = totalVentas > 0 ? (val / totalVentas) * 100 : 0
                return (
                  <div key={m.value}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{m.label}</span>
                      <span className="font-medium">{formatCurrency(val)} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* Top productos */}
        <Section title="Productos más vendidos">
          {topProductos.length === 0 ? (
            <p className="text-sm text-gray-400">Sin ventas este período</p>
          ) : (
            <div className="space-y-2">
              {topProductos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-sm text-gray-800">{p.nombre}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(p.total)}</div>
                    <div className="text-xs text-gray-400">{p.cantidad} u.</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Por vendedor */}
        <Section title="Ventas por vendedor">
          {ventasPorVendedor.length === 0 ? (
            <p className="text-sm text-gray-400">Sin ventas asignadas este período</p>
          ) : (
            <div className="space-y-3">
              {ventasPorVendedor.sort((a, b) => b.total - a.total).map((v, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{v.nombre}</div>
                    <div className="text-xs text-gray-400">{v.cantVentas} venta{v.cantVentas !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(v.total)}</div>
                    <div className="text-xs text-purple-600">Com: {formatCurrency(v.comision)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Gastos por categoría */}
        <Section title="Gastos por categoría">
          {Object.keys(gastosPorCategoria).length === 0 ? (
            <p className="text-sm text-gray-400">Sin gastos este período</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, total]) => {
                const pct = totalGastos > 0 ? (total / totalGastos) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{cat}</span>
                      <span className="font-medium">{formatCurrency(total)} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* Gastos por método de pago */}
        <Section title="Gastos por método de pago">
          {Object.keys(gastosPorMetodo).length === 0 ? (
            <p className="text-sm text-gray-400">Sin gastos este período</p>
          ) : (
            <div className="space-y-2">
              {METODOS_PAGO.map(m => {
                const val = gastosPorMetodo[m.value] || 0
                if (!val) return null
                const pct = totalGastos > 0 ? (val / totalGastos) * 100 : 0
                return (
                  <div key={m.value}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{m.label}</span>
                      <span className="font-medium">{formatCurrency(val)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

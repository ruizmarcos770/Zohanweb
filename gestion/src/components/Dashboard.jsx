import { useApp, formatCurrency } from '../context/AppContext'

function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  )
}

export default function Dashboard({ setPage }) {
  const { state } = useApp()
  const { ventas, gastos, productos, vendedores } = state

  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()

  const ventasMes = ventas.filter(v => {
    const d = new Date(v.fecha)
    return v.estado !== 'cancelada' && d.getMonth() === mesActual && d.getFullYear() === anioActual
  })
  const gastosMes = gastos.filter(g => {
    const d = new Date(g.fecha)
    return d.getMonth() === mesActual && d.getFullYear() === anioActual
  })

  const totalVentasMes = ventasMes.reduce((s, v) => s + v.total, 0)
  const totalGastosMes = gastosMes.reduce((s, g) => s + g.monto, 0)
  const gananciasMes = totalVentasMes - totalGastosMes
  const comisionesMes = ventasMes.reduce((s, v) => s + (v.comisionMonto || 0), 0)
  const stockBajo = productos.filter(p => p.stock <= p.stockMinimo)

  // Ventas recientes
  const recientes = [...ventas]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  // Por método de pago este mes
  const porMetodo = ventasMes.reduce((acc, v) => {
    acc[v.metodoPago] = (acc[v.metodoPago] || 0) + v.total
    return acc
  }, {})

  const metodoLabels = {
    efectivo: 'Efectivo',
    tarjeta_debito: 'Déb.',
    tarjeta_credito: 'Créd.',
    transferencia: 'Transfer.',
  }

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const nombreMes = meses[mesActual]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{nombreMes} {anioActual}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Ventas del mes"
          value={formatCurrency(totalVentasMes)}
          sub={`${ventasMes.length} comprobante${ventasMes.length !== 1 ? 's' : ''}`}
          color="blue"
          icon="🛒"
        />
        <StatCard
          label="Gastos del mes"
          value={formatCurrency(totalGastosMes)}
          sub={`${gastosMes.length} gasto${gastosMes.length !== 1 ? 's' : ''}`}
          color="red"
          icon="💸"
        />
        <StatCard
          label="Resultado"
          value={formatCurrency(gananciasMes)}
          sub={gananciasMes >= 0 ? 'Positivo ✓' : 'Negativo ✗'}
          color={gananciasMes >= 0 ? 'green' : 'red'}
          icon="📊"
        />
        <StatCard
          label="Comisiones"
          value={formatCurrency(comisionesMes)}
          sub={`${vendedores.length} vendedor${vendedores.length !== 1 ? 'es' : ''}`}
          color="purple"
          icon="💰"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ventas recientes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Ventas recientes</h2>
            <button
              onClick={() => setPage('ventas')}
              className="text-xs text-blue-600 hover:underline"
            >
              Ver todas →
            </button>
          </div>
          {recientes.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Sin ventas aún</p>
          ) : (
            <div className="space-y-2">
              {recientes.map(v => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-800">#{v.numero}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(v.fecha).toLocaleDateString('es-AR')}</span>
                    {v.estado === 'cancelada' && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Cancelada</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(v.total)}</div>
                    <div className="text-xs text-gray-400">{v.clienteNombre || 'Consumidor final'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas + método de pago */}
        <div className="space-y-4">
          {/* Stock bajo */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-3">
              Stock bajo
              {stockBajo.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{stockBajo.length}</span>
              )}
            </h2>
            {stockBajo.length === 0 ? (
              <p className="text-sm text-gray-400">Todo en orden ✓</p>
            ) : (
              <div className="space-y-2">
                {stockBajo.slice(0, 4).map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate mr-2">{p.nombre}</span>
                    <span className="text-red-600 font-medium whitespace-nowrap">{p.stock} u.</span>
                  </div>
                ))}
                {stockBajo.length > 4 && (
                  <button onClick={() => setPage('inventario')} className="text-xs text-blue-600 hover:underline">
                    +{stockBajo.length - 4} más →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Por método de pago */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Pagos del mes</h2>
            {Object.keys(porMetodo).length === 0 ? (
              <p className="text-sm text-gray-400">Sin ventas aún</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(porMetodo).map(([m, total]) => (
                  <div key={m} className="flex justify-between text-sm">
                    <span className="text-gray-600">{metodoLabels[m] || m}</span>
                    <span className="font-medium text-gray-800">{formatCurrency(total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

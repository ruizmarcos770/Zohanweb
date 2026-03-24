import { prisma } from '@/lib/db'
import { formatCurrency, MESES, CATEGORIA_GASTO_LABELS, TIPO_INGRESO_LABELS } from '@/lib/utils'
import { BarChart3, Users, DollarSign, Calendar, Pill } from 'lucide-react'

export default async function ReportesPage() {
  const now = new Date()
  const anio = now.getFullYear()

  // Datos del año actual - ingresos y gastos por mes
  const mesesData = await Promise.all(
    Array.from({ length: 12 }, (_, i) => i).map(async (mes) => {
      const start = new Date(anio, mes, 1)
      const end = new Date(anio, mes + 1, 1)
      const [ing, gas] = await Promise.all([
        prisma.ingreso.aggregate({ _sum: { monto: true }, where: { fecha: { gte: start, lt: end } } }),
        prisma.gasto.aggregate({ _sum: { monto: true }, where: { fecha: { gte: start, lt: end } } }),
      ])
      return {
        mes: MESES[mes],
        ingresos: ing._sum.monto ?? 0,
        gastos: gas._sum.monto ?? 0,
        balance: (ing._sum.monto ?? 0) - (gas._sum.monto ?? 0),
      }
    })
  )

  const [
    totalPacientesActivos,
    totalPacientesHistorico,
    pacientesResidencial,
    pacientesAmbulatorio,
    adicionesDist,
    totalSesiones,
    sesionesCompletadas,
    sesionesCanceladas,
    sesionesNoAsistio,
    totalIngresoAnio,
    totalGastoAnio,
    gastosPorCategoria,
    ingresosPorTipo,
    medicamentosBajoStock,
    totalMedicamentos,
    prescripcionesActivas,
  ] = await Promise.all([
    prisma.paciente.count({ where: { estado: 'ACTIVO' } }),
    prisma.paciente.count(),
    prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'RESIDENCIAL' } }),
    prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'AMBULATORIO' } }),
    prisma.paciente.groupBy({ by: ['tipoAdiccion'], _count: { id: true } }),
    prisma.sesion.count({ where: { fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.sesion.count({ where: { estado: 'COMPLETADA', fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.sesion.count({ where: { estado: 'CANCELADA', fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.sesion.count({ where: { estado: 'NO_ASISTIO', fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.ingreso.aggregate({ _sum: { monto: true }, where: { fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.gasto.aggregate({ _sum: { monto: true }, where: { fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } } }),
    prisma.gasto.groupBy({ by: ['categoria'], _sum: { monto: true }, where: { fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } }, orderBy: { _sum: { monto: 'desc' } } }),
    prisma.ingreso.groupBy({ by: ['tipo'], _sum: { monto: true }, where: { fecha: { gte: new Date(anio, 0, 1), lt: new Date(anio + 1, 0, 1) } }, orderBy: { _sum: { monto: 'desc' } } }),
    prisma.medicamento.count({ where: { activo: true, stock: { lte: 20 } } }),
    prisma.medicamento.count({ where: { activo: true } }),
    prisma.prescripcion.count({ where: { activa: true } }),
  ])

  const balanceAnio = (totalIngresoAnio._sum.monto ?? 0) - (totalGastoAnio._sum.monto ?? 0)
  const tasaAsistencia = totalSesiones > 0 ? Math.round((sesionesCompletadas / totalSesiones) * 100) : 0

  const maxIngresos = Math.max(...mesesData.map(m => m.ingresos), 1)

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Reportes — Año {anio}</h1>

      {/* Resumen General */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Users size={14} /> Pacientes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{totalPacientesActivos}</p>
            <p className="text-sm text-gray-500 mt-1">Activos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-700">{totalPacientesHistorico}</p>
            <p className="text-sm text-gray-500 mt-1">Total Histórico</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-indigo-700">{pacientesResidencial}</p>
            <p className="text-sm text-gray-500 mt-1">Internados</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{pacientesAmbulatorio}</p>
            <p className="text-sm text-gray-500 mt-1">Ambulatorios</p>
          </div>
        </div>

        {/* Distribución por adicción */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4">Distribución por Tipo de Adicción</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {adicionesDist.map(d => (
              <div key={d.tipoAdiccion} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{d._count.id}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.tipoAdiccion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sesiones */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Calendar size={14} /> Sesiones de Terapia ({anio})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{totalSesiones}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{sesionesCompletadas}</p>
            <p className="text-sm text-gray-500 mt-1">Completadas</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{sesionesCanceladas}</p>
            <p className="text-sm text-gray-500 mt-1">Canceladas</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold ${tasaAsistencia >= 80 ? 'text-green-700' : tasaAsistencia >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {tasaAsistencia}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Tasa de Asistencia</p>
          </div>
        </div>
      </section>

      {/* Finanzas */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <DollarSign size={14} /> Finanzas ({anio})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIngresoAnio._sum.monto ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Ingresos totales</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalGastoAnio._sum.monto ?? 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Gastos totales</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${balanceAnio >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
              {formatCurrency(balanceAnio)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Balance anual</p>
          </div>
        </div>

        {/* Gráfico de barras mensual (visual con divs) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4">Ingresos vs Gastos por Mes</h3>
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {mesesData.map((m) => (
              <div key={m.mes} className="flex-1 min-w-8 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '120px' }}>
                  <div
                    className="w-full bg-green-400 rounded-t opacity-80"
                    style={{ height: `${(m.ingresos / maxIngresos) * 100}px` }}
                    title={`Ingresos: ${formatCurrency(m.ingresos)}`}
                  />
                  <div
                    className="w-full bg-red-400 rounded-t opacity-80"
                    style={{ height: `${(m.gastos / maxIngresos) * 100}px` }}
                    title={`Gastos: ${formatCurrency(m.gastos)}`}
                  />
                </div>
                <p className="text-xs text-gray-500">{m.mes.substring(0, 3)}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded inline-block"></span> Ingresos</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded inline-block"></span> Gastos</span>
          </div>
        </div>

        {/* Desglose gastos e ingresos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-900 mb-4">Gastos por Categoría</h3>
            <div className="space-y-2">
              {gastosPorCategoria.map(g => {
                const pct = totalGastoAnio._sum.monto ? Math.round(((g._sum.monto ?? 0) / totalGastoAnio._sum.monto!) * 100) : 0
                return (
                  <div key={g.categoria}>
                    <div className="flex items-center justify-between text-sm mb-0.5">
                      <span className="text-gray-700">{CATEGORIA_GASTO_LABELS[g.categoria] ?? g.categoria}</span>
                      <span className="font-medium">{formatCurrency(g._sum.monto ?? 0)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-900 mb-4">Ingresos por Tipo</h3>
            <div className="space-y-2">
              {ingresosPorTipo.map(i => {
                const pct = totalIngresoAnio._sum.monto ? Math.round(((i._sum.monto ?? 0) / totalIngresoAnio._sum.monto!) * 100) : 0
                return (
                  <div key={i.tipo}>
                    <div className="flex items-center justify-between text-sm mb-0.5">
                      <span className="text-gray-700">{TIPO_INGRESO_LABELS[i.tipo] ?? i.tipo}</span>
                      <span className="font-medium">{formatCurrency(i._sum.monto ?? 0)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Medicamentos */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Pill size={14} /> Medicamentos
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{totalMedicamentos}</p>
            <p className="text-sm text-gray-500 mt-1">Medicamentos en stock</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold ${medicamentosBajoStock > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {medicamentosBajoStock}
            </p>
            <p className="text-sm text-gray-500 mt-1">Con stock crítico</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">{prescripcionesActivas}</p>
            <p className="text-sm text-gray-500 mt-1">Prescripciones activas</p>
          </div>
        </div>
      </section>
    </div>
  )
}

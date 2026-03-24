import { prisma } from '@/lib/db'
import StatCard from '@/components/ui/StatCard'
import { Users, Calendar, Pill, DollarSign, BedDouble, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDateTime, TIPO_TRATAMIENTO_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [
    totalPacientes,
    pacientesResidenciales,
    pacientesAmbulatorios,
    sesionesHoy,
    medicamentosBajoStock,
    totalHabitaciones,
    habitacionesOcupadas,
    ingresosMes,
    gastosMes,
    pacientesRecientes,
    sesionesProximas,
    notasRecientes,
  ] = await Promise.all([
    prisma.paciente.count({ where: { estado: 'ACTIVO' } }),
    prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'RESIDENCIAL' } }),
    prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'AMBULATORIO' } }),
    prisma.sesion.count({ where: { fecha: { gte: startOfDay, lte: endOfDay } } }),
    prisma.medicamento.count({ where: { activo: true, stock: { lte: 20 } } }),
    prisma.habitacion.count({ where: { activa: true } }),
    prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'RESIDENCIAL', habitacionId: { not: null } } }),
    prisma.ingreso.aggregate({ _sum: { monto: true }, where: { fecha: { gte: startOfMonth, lt: startOfNextMonth } } }),
    prisma.gasto.aggregate({ _sum: { monto: true }, where: { fecha: { gte: startOfMonth, lt: startOfNextMonth } } }),
    prisma.paciente.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { fechaIngreso: 'desc' },
      take: 5,
      select: { id: true, nombre: true, apellido: true, tipoTratamiento: true, tipoAdiccion: true, fechaIngreso: true },
    }),
    prisma.sesion.findMany({
      where: { fecha: { gte: now }, estado: 'PROGRAMADA' },
      orderBy: { fecha: 'asc' },
      take: 6,
      include: {
        paciente: { select: { nombre: true, apellido: true } },
        staff: { select: { nombre: true, apellido: true } },
        sesionGrupo: { select: { nombre: true } },
      },
    }),
    prisma.notaEvolucion.findMany({
      orderBy: { fecha: 'desc' },
      take: 4,
      include: {
        paciente: { select: { nombre: true, apellido: true } },
        staff: { select: { nombre: true, apellido: true } },
      },
    }),
  ])

  const balanceMes = (ingresosMes._sum.monto ?? 0) - (gastosMes._sum.monto ?? 0)
  const ocupacion = totalHabitaciones > 0 ? Math.round((habitacionesOcupadas / totalHabitaciones) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pacientes Activos" value={totalPacientes} subtitle={`${pacientesResidenciales} internados · ${pacientesAmbulatorios} ambulatorios`} icon={Users} color="#2563eb" />
        <StatCard title="Sesiones Hoy" value={sesionesHoy} subtitle="Programadas para hoy" icon={Calendar} color="#7c3aed" />
        <StatCard title="Ocupación" value={`${ocupacion}%`} subtitle={`${habitacionesOcupadas} / ${totalHabitaciones} habitaciones`} icon={BedDouble} color="#059669" />
        <StatCard title="Balance del Mes" value={formatCurrency(balanceMes)} subtitle={balanceMes >= 0 ? 'Superávit' : 'Déficit'} icon={DollarSign} color={balanceMes >= 0 ? '#059669' : '#dc2626'} trend={balanceMes >= 0 ? { value: 'Positivo', positive: true } : { value: 'Negativo', positive: false }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Ingresos del Mes" value={formatCurrency(ingresosMes._sum.monto ?? 0)} icon={TrendingUp} color="#0284c7" />
        <StatCard title="Gastos del Mes" value={formatCurrency(gastosMes._sum.monto ?? 0)} icon={DollarSign} color="#dc2626" />
        <StatCard title="Medicamentos Bajo Stock" value={medicamentosBajoStock} subtitle={medicamentosBajoStock > 0 ? 'Requieren reposición' : 'Stock OK'} icon={Pill} color={medicamentosBajoStock > 0 ? '#dc2626' : '#059669'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" /> Próximas Sesiones
            </h2>
            <Link href="/sesiones" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
          </div>
          {sesionesProximas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay sesiones programadas</p>
          ) : (
            <div className="space-y-2">
              {sesionesProximas.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {s.paciente ? `${s.paciente.nombre} ${s.paciente.apellido}` : s.sesionGrupo?.nombre ?? 'Sesión Grupal'}
                    </p>
                    <p className="text-xs text-gray-500">{s.subtipo ?? s.tipo} · {s.staff ? `${s.staff.nombre} ${s.staff.apellido}` : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700">{new Date(s.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</p>
                    <p className="text-xs text-gray-500">{new Date(s.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Pacientes Activos Recientes
            </h2>
            <Link href="/pacientes" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {pacientesRecientes.map((p) => (
              <Link key={p.id} href={`/pacientes/${p.id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.nombre} {p.apellido}</p>
                  <p className="text-xs text-gray-500">{p.tipoAdiccion}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_TRATAMIENTO_COLORS[p.tipoTratamiento]}`}>
                    {p.tipoTratamiento === 'RESIDENCIAL' ? 'Internado' : 'Ambulatorio'}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(p.fechaIngreso).toLocaleDateString('es-AR')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" /> Alertas
          </h2>
          <div className="space-y-3">
            {medicamentosBajoStock > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <Pill size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Stock bajo de medicamentos</p>
                  <p className="text-xs text-red-600">{medicamentosBajoStock} medicamento(s) con stock crítico</p>
                </div>
              </div>
            )}
            {ocupacion >= 90 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <BedDouble size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Alta ocupación</p>
                  <p className="text-xs text-amber-600">Capacidad al {ocupacion}%</p>
                </div>
              </div>
            )}
            {medicamentosBajoStock === 0 && ocupacion < 90 && (
              <p className="text-sm text-gray-400 text-center py-4">No hay alertas activas</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Notas de Evolución Recientes</h2>
          <div className="space-y-3">
            {notasRecientes.map((n) => (
              <div key={n.id} className="py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm font-medium text-gray-900">{n.paciente.nombre} {n.paciente.apellido}</p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.contenido}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{n.staff ? `${n.staff.nombre} ${n.staff.apellido}` : '—'} · {n.tipo}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(n.fecha)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

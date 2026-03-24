import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatDateTime, SESION_ESTADO_COLORS } from '@/lib/utils'
import { CalendarPlus } from 'lucide-react'

export default async function SesionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tipo?: string; fecha?: string }>
}) {
  const params = await searchParams
  const estado = params.estado ?? ''
  const tipo = params.tipo ?? ''
  const fecha = params.fecha ?? ''

  const whereDate = fecha
    ? {
        fecha: {
          gte: new Date(fecha + 'T00:00:00'),
          lte: new Date(fecha + 'T23:59:59'),
        },
      }
    : {}

  const sesiones = await prisma.sesion.findMany({
    where: {
      ...(estado ? { estado } : {}),
      ...(tipo ? { tipo } : {}),
      ...whereDate,
    },
    include: {
      paciente: { select: { nombre: true, apellido: true, id: true } },
      staff: { select: { nombre: true, apellido: true, rol: true } },
      sesionGrupo: { select: { nombre: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })

  const stats = {
    programadas: sesiones.filter(s => s.estado === 'PROGRAMADA').length,
    completadas: sesiones.filter(s => s.estado === 'COMPLETADA').length,
    canceladas: sesiones.filter(s => s.estado === 'CANCELADA').length,
    noAsistio: sesiones.filter(s => s.estado === 'NO_ASISTIO').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Programadas: <strong className="text-blue-700">{stats.programadas}</strong></span>
          <span>Completadas: <strong className="text-green-700">{stats.completadas}</strong></span>
          <span>Canceladas: <strong className="text-red-600">{stats.canceladas}</strong></span>
        </div>
        <Link
          href="/sesiones/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <CalendarPlus size={16} />
          Nueva Sesión
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <input
            type="date"
            name="fecha"
            defaultValue={fecha}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            name="estado"
            defaultValue={estado}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos los estados</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="NO_ASISTIO">No asistió</option>
          </select>
          <select
            name="tipo"
            defaultValue={tipo}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos los tipos</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="GRUPAL">Grupal</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">
            Filtrar
          </button>
          {(estado || tipo || fecha) && (
            <Link href="/sesiones" className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha y Hora</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente / Grupo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subtipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Terapeuta</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Duración</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sesiones.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">No se encontraron sesiones</td>
              </tr>
            ) : (
              sesiones.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {formatDateTime(s.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    {s.paciente ? (
                      <Link href={`/pacientes/${s.paciente.id}`} className="text-blue-600 hover:underline font-medium">
                        {s.paciente.nombre} {s.paciente.apellido}
                      </Link>
                    ) : (
                      <span className="text-gray-700">{s.sesionGrupo?.nombre ?? 'Grupal'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.tipo === 'INDIVIDUAL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {s.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.subtipo?.replace(/_/g, ' ') ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.staff ? `${s.staff.nombre} ${s.staff.apellido}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.duracion} min</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SESION_ESTADO_COLORS[s.estado]}`}>
                      {s.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.notas && (
                      <span title={s.notas} className="text-gray-400 cursor-help">📝</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { prisma } from '@/lib/db'
import Link from 'next/link'
import { calcularEdad, calcularDiasInternado, ESTADO_PACIENTE_COLORS, TIPO_TRATAMIENTO_COLORS } from '@/lib/utils'
import { UserPlus, Search } from 'lucide-react'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; tipo?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ''
  const estado = params.estado ?? ''
  const tipo = params.tipo ?? ''

  const pacientes = await prisma.paciente.findMany({
    where: {
      AND: [
        estado ? { estado } : {},
        tipo ? { tipoTratamiento: tipo } : {},
        q
          ? {
              OR: [
                { nombre: { contains: q } },
                { apellido: { contains: q } },
                { dni: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: {
      habitacion: { select: { numero: true } },
      prescripciones: { where: { activa: true }, select: { id: true } },
      sesiones: { where: { estado: 'PROGRAMADA' }, select: { id: true } },
    },
    orderBy: [{ estado: 'asc' }, { apellido: 'asc' }],
  })

  const totalActivos = await prisma.paciente.count({ where: { estado: 'ACTIVO' } })
  const totalResidenciales = await prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'RESIDENCIAL' } })
  const totalAmbulatorios = await prisma.paciente.count({ where: { estado: 'ACTIVO', tipoTratamiento: 'AMBULATORIO' } })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Total activos: <strong className="text-gray-900">{totalActivos}</strong></span>
          <span>Internados: <strong className="text-blue-700">{totalResidenciales}</strong></span>
          <span>Ambulatorios: <strong className="text-purple-700">{totalAmbulatorios}</strong></span>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={16} />
          Nuevo Paciente
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            name="estado"
            defaultValue={estado}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="EGRESADO">Egresado</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
          <select
            name="tipo"
            defaultValue={tipo}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="RESIDENCIAL">Residencial</option>
            <option value="AMBULATORIO">Ambulatorio</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Buscar
          </button>
          {(q || estado || tipo) && (
            <Link
              href="/pacientes"
              className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Edad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Adicción</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ingreso</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Días</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Info</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{p.apellido}, {p.nombre}</p>
                      {p.tipoTratamiento === 'RESIDENCIAL' && p.habitacion && (
                        <p className="text-xs text-gray-400">Hab. {p.habitacion.numero}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.dni}</td>
                  <td className="px-4 py-3 text-gray-600">{calcularEdad(p.fechaNacimiento)} años</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_TRATAMIENTO_COLORS[p.tipoTratamiento]}`}>
                      {p.tipoTratamiento === 'RESIDENCIAL' ? 'Internado' : 'Ambulatorio'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.tipoAdiccion}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(p.fechaIngreso).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.estado === 'ACTIVO' ? calcularDiasInternado(p.fechaIngreso) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_PACIENTE_COLORS[p.estado]}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span title="Medicaciones activas">💊 {p.prescripciones.length}</span>
                      <span title="Sesiones programadas">📅 {p.sesiones.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium"
                    >
                      Ver ficha
                    </Link>
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

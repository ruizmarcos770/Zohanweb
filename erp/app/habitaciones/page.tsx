import { prisma } from '@/lib/db'
import Link from 'next/link'
import { calcularDiasInternado } from '@/lib/utils'
import { BedDouble, PlusCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function HabitacionesPage() {
  const habitaciones = await prisma.habitacion.findMany({
    where: { activa: true },
    include: {
      pacientes: {
        where: { estado: 'ACTIVO' },
        select: { id: true, nombre: true, apellido: true, fechaIngreso: true, tipoAdiccion: true },
      },
    },
    orderBy: [{ piso: 'asc' }, { numero: 'asc' }],
  })

  const totalCamas = habitaciones.reduce((s, h) => s + h.capacidad, 0)
  const camasOcupadas = habitaciones.reduce((s, h) => s + h.pacientes.length, 0)
  const ocupacion = totalCamas > 0 ? Math.round((camasOcupadas / totalCamas) * 100) : 0

  async function crearHabitacion(formData: FormData) {
    'use server'
    await prisma.habitacion.create({
      data: {
        numero: formData.get('numero') as string,
        nombre: (formData.get('nombre') as string) || null,
        tipo: formData.get('tipo') as string,
        capacidad: parseInt(formData.get('capacidad') as string),
        piso: parseInt(formData.get('piso') as string) || 1,
        descripcion: (formData.get('descripcion') as string) || null,
      },
    })
    redirect('/habitaciones')
  }

  const TIPO_HAB_COLORS: Record<string, string> = {
    INDIVIDUAL: 'bg-blue-100 text-blue-700',
    DOBLE: 'bg-green-100 text-green-700',
    MULTIPLE: 'bg-orange-100 text-orange-700',
  }

  // Agrupar por piso
  const pisos: Record<number, typeof habitaciones> = {}
  habitaciones.forEach(h => {
    if (!pisos[h.piso]) pisos[h.piso] = []
    pisos[h.piso].push(h)
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{habitaciones.length}</p>
          <p className="text-sm text-gray-500">Habitaciones</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{camasOcupadas} / {totalCamas}</p>
          <p className="text-sm text-gray-500">Camas ocupadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className={`text-2xl font-bold ${ocupacion >= 90 ? 'text-red-600' : ocupacion >= 70 ? 'text-amber-600' : 'text-green-700'}`}>
            {ocupacion}%
          </p>
          <p className="text-sm text-gray-500">Ocupación</p>
        </div>
      </div>

      {/* Habitaciones por piso */}
      {Object.entries(pisos).map(([piso, habs]) => (
        <div key={piso}>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Piso {piso}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habs.map((h) => {
              const ocupada = h.pacientes.length
              const libre = h.capacidad - ocupada
              const porcentaje = Math.round((ocupada / h.capacidad) * 100)

              return (
                <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <BedDouble size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Hab. {h.numero}</p>
                        {h.nombre && <p className="text-xs text-gray-400">{h.nombre}</p>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_HAB_COLORS[h.tipo]}`}>
                      {h.tipo}
                    </span>
                  </div>

                  {/* Barra de ocupación */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{ocupada} / {h.capacidad} camas</span>
                      <span className={porcentaje >= 100 ? 'text-red-600 font-medium' : 'text-gray-500'}>{porcentaje}% ocupado</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${porcentaje >= 100 ? 'bg-red-500' : porcentaje >= 75 ? 'bg-amber-400' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Pacientes */}
                  {h.pacientes.length > 0 ? (
                    <div className="space-y-1.5">
                      {h.pacientes.map(p => (
                        <Link
                          key={p.id}
                          href={`/pacientes/${p.id}`}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-blue-50 group"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{p.nombre} {p.apellido}</p>
                            <p className="text-xs text-gray-400">{p.tipoAdiccion}</p>
                          </div>
                          <span className="text-xs text-gray-400">{calcularDiasInternado(p.fechaIngreso)} días</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 font-medium text-center py-2">✓ Disponible</p>
                  )}

                  {libre > 0 && ocupada > 0 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">{libre} cama(s) disponible(s)</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Agregar Habitación */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-blue-600" /> Agregar Habitación
        </h2>
        <form action={crearHabitacion} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Número *</label>
            <input name="numero" required placeholder="Ej: 301" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
            <input name="nombre" placeholder="Opcional" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo *</label>
            <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="INDIVIDUAL">Individual</option>
              <option value="DOBLE">Doble</option>
              <option value="MULTIPLE">Múltiple</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Capacidad *</label>
            <input name="capacidad" type="number" min={1} max={10} defaultValue={1} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Piso</label>
            <input name="piso" type="number" min={1} defaultValue={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <input name="descripcion" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 mt-4">
              Agregar Habitación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

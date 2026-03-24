import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ROL_LABELS } from '@/lib/utils'
import { UserPlus, Phone, Mail } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function PersonalPage() {
  const staff = await prisma.staff.findMany({
    include: {
      sesiones: { where: { estado: { in: ['PROGRAMADA', 'COMPLETADA'] } }, select: { id: true } },
      prescripciones: { where: { activa: true }, select: { id: true } },
    },
    orderBy: [{ activo: 'desc' }, { apellido: 'asc' }],
  })

  async function crearStaff(formData: FormData) {
    'use server'
    await prisma.staff.create({
      data: {
        nombre: formData.get('nombre') as string,
        apellido: formData.get('apellido') as string,
        email: formData.get('email') as string,
        telefono: (formData.get('telefono') as string) || null,
        rol: formData.get('rol') as string,
        especialidad: (formData.get('especialidad') as string) || null,
        licencia: (formData.get('licencia') as string) || null,
      },
    })
    redirect('/personal')
  }

  const ROL_COLORS: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    MEDICO: 'bg-blue-100 text-blue-700',
    PSICOLOGO: 'bg-indigo-100 text-indigo-700',
    ENFERMERO: 'bg-teal-100 text-teal-700',
    TERAPEUTA: 'bg-orange-100 text-orange-700',
    ADMINISTRATIVO: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl border border-gray-200 p-5 ${!s.activo ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {s.nombre[0]}{s.apellido[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.nombre} {s.apellido}</p>
                  {s.especialidad && <p className="text-xs text-gray-400">{s.especialidad}</p>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLORS[s.rol] ?? 'bg-gray-100 text-gray-700'}`}>
                {ROL_LABELS[s.rol] ?? s.rol}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              {s.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={13} className="text-gray-400" />
                  <span className="text-xs">{s.email}</span>
                </div>
              )}
              {s.telefono && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={13} className="text-gray-400" />
                  <span className="text-xs">{s.telefono}</span>
                </div>
              )}
              {s.licencia && (
                <p className="text-xs text-gray-500">Licencia: {s.licencia}</p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
              <span>📅 {s.sesiones.length} sesiones</span>
              {(s.rol === 'MEDICO' || s.rol === 'PSICOLOGO') && (
                <span>💊 {s.prescripciones.length} prescripciones activas</span>
              )}
            </div>

            {!s.activo && (
              <div className="mt-2 text-xs text-red-500 font-medium">Inactivo</div>
            )}
          </div>
        ))}
      </div>

      {/* Agregar Staff */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-blue-600" /> Agregar Personal
        </h2>
        <form action={crearStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Apellido *</label>
            <input name="apellido" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input name="telefono" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rol *</label>
            <select name="rol" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(ROL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Especialidad</label>
            <input name="especialidad" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">N° Licencia / Matrícula</label>
            <input name="licencia" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Agregar Personal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

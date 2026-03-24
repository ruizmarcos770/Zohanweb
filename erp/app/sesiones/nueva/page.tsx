import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function NuevaSesionPage() {
  const [pacientes, staff, grupos] = await Promise.all([
    prisma.paciente.findMany({
      where: { estado: 'ACTIVO' },
      orderBy: { apellido: 'asc' },
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      orderBy: { apellido: 'asc' },
    }),
    prisma.sesionGrupo.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  async function crearSesion(formData: FormData) {
    'use server'
    const tipo = formData.get('tipo') as string
    const pacienteId = formData.get('pacienteId') as string
    const sesionGrupoId = formData.get('sesionGrupoId') as string

    await prisma.sesion.create({
      data: {
        tipo,
        subtipo: (formData.get('subtipo') as string) || null,
        fecha: new Date(formData.get('fecha') as string),
        duracion: parseInt(formData.get('duracion') as string) || 60,
        estado: 'PROGRAMADA',
        notas: (formData.get('notas') as string) || null,
        pacienteId: tipo === 'INDIVIDUAL' ? pacienteId || null : null,
        sesionGrupoId: tipo === 'GRUPAL' ? sesionGrupoId || null : null,
        staffId: (formData.get('staffId') as string) || null,
      },
    })
    redirect('/sesiones')
  }

  const now = new Date()
  const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/sesiones" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nueva Sesión de Terapia</h1>
      </div>

      <form action={crearSesion} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Sesión *</label>
            <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="INDIVIDUAL">Individual</option>
              <option value="GRUPAL">Grupal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtipo</label>
            <select name="subtipo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Sin especificar</option>
              <option value="PSICOLOGICA">Psicológica</option>
              <option value="PSIQUIATRICA">Psiquiátrica</option>
              <option value="GRUPAL_TERAPEUTICA">Grupal Terapéutica</option>
              <option value="FAMILIAR">Familiar</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paciente (para sesión individual)</label>
          <select name="pacienteId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Seleccionar paciente...</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grupo (para sesión grupal)</label>
          <select name="sesionGrupoId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Seleccionar grupo...</option>
            {grupos.map(g => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Terapeuta / Profesional</label>
          <select name="staffId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Sin asignar</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.apellido}, {s.nombre} ({s.rol})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
            <input
              name="fecha"
              type="datetime-local"
              defaultValue={localISO}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
            <input
              name="duracion"
              type="number"
              defaultValue={60}
              min={15}
              step={15}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            name="notas"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            Programar Sesión
          </button>
          <Link href="/sesiones" className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

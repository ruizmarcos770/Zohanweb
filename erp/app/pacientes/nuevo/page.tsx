import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function NuevoPacientePage() {
  const habitaciones = await prisma.habitacion.findMany({ where: { activa: true }, orderBy: { numero: 'asc' } })

  async function crearPaciente(formData: FormData) {
    'use server'
    const tipo = formData.get('tipoTratamiento') as string
    const hab = formData.get('habitacionId') as string

    const paciente = await prisma.paciente.create({
      data: {
        nombre: formData.get('nombre') as string,
        apellido: formData.get('apellido') as string,
        dni: formData.get('dni') as string,
        fechaNacimiento: new Date(formData.get('fechaNacimiento') as string),
        sexo: formData.get('sexo') as string,
        telefono: (formData.get('telefono') as string) || null,
        email: (formData.get('email') as string) || null,
        direccion: (formData.get('direccion') as string) || null,
        ciudad: (formData.get('ciudad') as string) || null,
        provincia: (formData.get('provincia') as string) || null,
        contactoEmergNombre: (formData.get('contactoEmergNombre') as string) || null,
        contactoEmergTel: (formData.get('contactoEmergTel') as string) || null,
        contactoEmergRelacion: (formData.get('contactoEmergRelacion') as string) || null,
        tipoTratamiento: tipo,
        tipoAdiccion: formData.get('tipoAdiccion') as string,
        sustanciasPrincipales: (formData.get('sustanciasPrincipales') as string) || null,
        fechaIngreso: new Date(formData.get('fechaIngreso') as string),
        grupoSanguineo: (formData.get('grupoSanguineo') as string) || null,
        alergias: (formData.get('alergias') as string) || null,
        antecedentesMedicos: (formData.get('antecedentesMedicos') as string) || null,
        medicacionPrevia: (formData.get('medicacionPrevia') as string) || null,
        obraSocial: (formData.get('obraSocial') as string) || null,
        nroAfiliado: (formData.get('nroAfiliado') as string) || null,
        habitacionId: (tipo === 'RESIDENCIAL' && hab) ? hab : null,
      },
    })

    await prisma.cuentaPaciente.create({ data: { pacienteId: paciente.id, saldo: 0 } })

    redirect(`/pacientes/${paciente.id}`)
  }

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pacientes" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nuevo Paciente</h1>
      </div>

      <form action={crearPaciente} className="space-y-6">
        {/* Datos Personales */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Datos Personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input name="nombre" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input name="apellido" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input name="dni" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
              <input name="fechaNacimiento" type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
              <select name="sexo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="telefono" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input name="direccion" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input name="ciudad" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input name="provincia" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Contacto de Emergencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input name="contactoEmergNombre" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input name="contactoEmergTel" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relación</label>
              <input name="contactoEmergRelacion" placeholder="Ej: Madre, Esposo/a..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Datos del Tratamiento */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Datos del Tratamiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tratamiento *</label>
              <select name="tipoTratamiento" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option value="RESIDENCIAL">Residencial (Internado)</option>
                <option value="AMBULATORIO">Ambulatorio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Adicción *</label>
              <select name="tipoAdiccion" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option value="ALCOHOL">Alcohol</option>
                <option value="DROGAS">Drogas</option>
                <option value="MULTIPLE">Múltiple (alcohol + drogas)</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sustancias principales</label>
              <input name="sustanciasPrincipales" placeholder="Ej: Cocaína, Alcohol, Marihuana..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso *</label>
              <input name="fechaIngreso" type="date" defaultValue={hoy} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habitación (solo residenciales)</label>
              <select name="habitacionId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin asignar</option>
                {habitaciones.map((h) => (
                  <option key={h.id} value={h.id}>
                    Hab. {h.numero} — {h.tipo} (cap. {h.capacidad})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Datos Médicos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Datos Médicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Sanguíneo</label>
              <select name="grupoSanguineo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">No especificado</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alergias conocidas</label>
              <input name="alergias" placeholder="Ej: Penicilina, AINES..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes Médicos</label>
              <textarea name="antecedentesMedicos" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicación previa al ingreso</label>
              <textarea name="medicacionPrevia" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Cobertura */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b">Cobertura Médica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obra Social / Seguro</label>
              <input name="obraSocial" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nro. Afiliado</label>
              <input name="nroAfiliado" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Paciente
          </button>
          <Link href="/pacientes" className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

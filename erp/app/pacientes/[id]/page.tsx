import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { calcularEdad, calcularDiasInternado, formatDate, formatDateTime, TIPO_TRATAMIENTO_COLORS, ESTADO_PACIENTE_COLORS, SESION_ESTADO_COLORS } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, User, Calendar, Pill, ClipboardList, Heart, AlertCircle } from 'lucide-react'
import NuevaNotaForm from './NuevaNotaForm'

export default async function PacienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      habitacion: true,
      cuentaCorriente: true,
      prescripciones: {
        include: { medicamento: true, staff: { select: { nombre: true, apellido: true, rol: true } } },
        orderBy: { createdAt: 'desc' },
      },
      sesiones: {
        include: { staff: { select: { nombre: true, apellido: true } } },
        orderBy: { fecha: 'desc' },
        take: 10,
      },
      notasEvolucion: {
        include: { staff: { select: { nombre: true, apellido: true, rol: true } } },
        orderBy: { fecha: 'desc' },
        take: 10,
      },
    },
  })

  if (!paciente) notFound()

  const prescripcionesActivas = paciente.prescripciones.filter(p => p.activa)
  const prescripcionesInactivas = paciente.prescripciones.filter(p => !p.activa)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pacientes" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {paciente.nombre} {paciente.apellido}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADO_PACIENTE_COLORS[paciente.estado]}`}>
                {paciente.estado}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TIPO_TRATAMIENTO_COLORS[paciente.tipoTratamiento]}`}>
                {paciente.tipoTratamiento === 'RESIDENCIAL' ? 'Internado' : 'Ambulatorio'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              DNI: {paciente.dni} · {calcularEdad(paciente.fechaNacimiento)} años ·
              {paciente.tipoAdiccion} ·
              {paciente.estado === 'ACTIVO' ? ` ${calcularDiasInternado(paciente.fechaIngreso)} días en tratamiento` : ` Egresó ${formatDate(paciente.fechaEgreso!)}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/pacientes/${id}/editar`}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - datos personales */}
        <div className="lg:col-span-1 space-y-4">
          {/* Datos Personales */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <User size={16} className="text-blue-600" /> Datos Personales
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Nacimiento</p>
                  <p className="font-medium">{formatDate(paciente.fechaNacimiento)} ({calcularEdad(paciente.fechaNacimiento)} años)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Sexo</p>
                  <p className="font-medium">{paciente.sexo}</p>
                </div>
              </div>
              {paciente.telefono && (
                <div className="flex items-start gap-2">
                  <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium">{paciente.telefono}</p>
                  </div>
                </div>
              )}
              {paciente.email && (
                <div className="flex items-start gap-2">
                  <Mail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{paciente.email}</p>
                  </div>
                </div>
              )}
              {paciente.direccion && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-500">Dirección</p>
                    <p className="font-medium">{paciente.direccion}, {paciente.ciudad}, {paciente.provincia}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contacto de Emergencia */}
          {paciente.contactoEmergNombre && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-red-500" /> Contacto de Emergencia
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{paciente.contactoEmergNombre}</p>
                <p className="text-gray-500">{paciente.contactoEmergRelacion}</p>
                <p className="text-blue-600">{paciente.contactoEmergTel}</p>
              </div>
            </div>
          )}

          {/* Datos Clínicos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Heart size={16} className="text-red-500" /> Datos Clínicos
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Tipo de Adicción</p>
                <p className="font-medium">{paciente.tipoAdiccion}</p>
              </div>
              {paciente.sustanciasPrincipales && (
                <div>
                  <p className="text-gray-500 text-xs">Sustancias principales</p>
                  <p className="font-medium">{paciente.sustanciasPrincipales}</p>
                </div>
              )}
              {paciente.grupoSanguineo && (
                <div>
                  <p className="text-gray-500 text-xs">Grupo sanguíneo</p>
                  <p className="font-medium">{paciente.grupoSanguineo}</p>
                </div>
              )}
              {paciente.alergias && (
                <div>
                  <p className="text-gray-500 text-xs">Alergias</p>
                  <p className="font-medium text-red-700">{paciente.alergias}</p>
                </div>
              )}
              {paciente.antecedentesMedicos && (
                <div>
                  <p className="text-gray-500 text-xs">Antecedentes médicos</p>
                  <p className="font-medium">{paciente.antecedentesMedicos}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs">Fecha de ingreso</p>
                <p className="font-medium">{formatDate(paciente.fechaIngreso)}</p>
              </div>
              {paciente.tipoTratamiento === 'RESIDENCIAL' && paciente.habitacion && (
                <div>
                  <p className="text-gray-500 text-xs">Habitación</p>
                  <p className="font-medium">Hab. {paciente.habitacion.numero} ({paciente.habitacion.tipo})</p>
                </div>
              )}
              {paciente.obraSocial && (
                <div>
                  <p className="text-gray-500 text-xs">Obra Social</p>
                  <p className="font-medium">{paciente.obraSocial} — Afil. {paciente.nroAfiliado}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prescripciones Activas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Pill size={16} className="text-green-600" /> Medicación Activa
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{prescripcionesActivas.length}</span>
              </h2>
            </div>
            {prescripcionesActivas.length === 0 ? (
              <p className="text-sm text-gray-400">No hay medicación activa</p>
            ) : (
              <div className="space-y-3">
                {prescripcionesActivas.map((presc) => (
                  <div key={presc.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{presc.medicamento.nombre}</p>
                        {presc.medicamento.principioActivo && (
                          <p className="text-xs text-gray-500">{presc.medicamento.principioActivo} {presc.medicamento.concentracion}</p>
                        )}
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">{presc.via}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>Dosis: <strong>{presc.dosis}</strong></span>
                      <span>Frecuencia: <strong>{presc.frecuencia.replace(/_/g, ' ')}</strong></span>
                    </div>
                    {presc.indicaciones && (
                      <p className="text-xs text-gray-500 mt-1 italic">{presc.indicaciones}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Dr/a. {presc.staff?.nombre} {presc.staff?.apellido} · Desde {formatDate(presc.fechaInicio)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {prescripcionesInactivas.length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Ver historial de medicación ({prescripcionesInactivas.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {prescripcionesInactivas.map((presc) => (
                    <div key={presc.id} className="p-2 bg-gray-50 rounded border border-gray-100 opacity-70">
                      <p className="text-sm text-gray-600">{presc.medicamento.nombre} — {presc.dosis} — {presc.via}</p>
                      <p className="text-xs text-gray-400">{formatDate(presc.fechaInicio)} → {presc.fechaFin ? formatDate(presc.fechaFin) : 'Suspendida'}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Sesiones */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" /> Sesiones de Terapia
              </h2>
            </div>
            {paciente.sesiones.length === 0 ? (
              <p className="text-sm text-gray-400">No hay sesiones registradas</p>
            ) : (
              <div className="space-y-2">
                {paciente.sesiones.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.subtipo ?? s.tipo}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(s.fecha)} · {s.duracion} min
                        {s.staff && ` · ${s.staff.nombre} ${s.staff.apellido}`}
                      </p>
                      {s.notas && <p className="text-xs text-gray-600 mt-1 italic">{s.notas}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SESION_ESTADO_COLORS[s.estado]}`}>
                      {s.estado.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas de Evolución */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList size={16} className="text-orange-500" /> Notas de Evolución
              </h2>
            </div>

            <NuevaNotaForm pacienteId={paciente.id} />

            {paciente.notasEvolucion.length === 0 ? (
              <p className="text-sm text-gray-400">No hay notas registradas</p>
            ) : (
              <div className="space-y-3 mt-4">
                {paciente.notasEvolucion.map((nota) => (
                  <div key={nota.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          nota.tipo === 'MEDICA' ? 'bg-blue-100 text-blue-700' :
                          nota.tipo === 'PSICOLOGICA' ? 'bg-purple-100 text-purple-700' :
                          nota.tipo === 'ENFERMERIA' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{nota.tipo}</span>
                        <span className="text-xs text-gray-500">{nota.staff ? `${nota.staff.nombre} ${nota.staff.apellido}` : '—'}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatDateTime(nota.fecha)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{nota.contenido}</p>
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

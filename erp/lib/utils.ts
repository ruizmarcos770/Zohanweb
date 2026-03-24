import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcularEdad(fechaNacimiento: Date | string): number {
  const hoy = new Date()
  const nac = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento
  let edad = hoy.getFullYear() - nac.getFullYear()
  const mes = hoy.getMonth() - nac.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) {
    edad--
  }
  return edad
}

export function calcularDiasInternado(fechaIngreso: Date | string): number {
  const hoy = new Date()
  const ingreso = typeof fechaIngreso === 'string' ? new Date(fechaIngreso) : fechaIngreso
  const diff = hoy.getTime() - ingreso.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const ROL_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  PSICOLOGO: 'Psicólogo',
  ENFERMERO: 'Enfermero',
  TERAPEUTA: 'Terapeuta',
  ADMINISTRATIVO: 'Administrativo',
}

export const ESTADO_PACIENTE_COLORS: Record<string, string> = {
  ACTIVO: 'bg-green-100 text-green-800',
  EGRESADO: 'bg-gray-100 text-gray-800',
  SUSPENDIDO: 'bg-yellow-100 text-yellow-800',
}

export const TIPO_TRATAMIENTO_COLORS: Record<string, string> = {
  RESIDENCIAL: 'bg-blue-100 text-blue-800',
  AMBULATORIO: 'bg-purple-100 text-purple-800',
}

export const SESION_ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
  NO_ASISTIO: 'bg-yellow-100 text-yellow-800',
}

export const CATEGORIA_GASTO_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  MEDICAMENTOS: 'Medicamentos',
  INSUMOS: 'Insumos',
  SERVICIOS: 'Servicios',
  MANTENIMIENTO: 'Mantenimiento',
  ALQUILER: 'Alquiler',
  ALIMENTACION: 'Alimentación',
  OTRO: 'Otro',
}

export const TIPO_INGRESO_LABELS: Record<string, string> = {
  HONORARIOS: 'Honorarios',
  CUOTA_MENSUAL: 'Cuota Mensual',
  OBRA_SOCIAL: 'Obra Social',
  DONACION: 'Donación',
  SUBSIDIO: 'Subsidio',
  OTRO: 'Otro',
}

export const MESES: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

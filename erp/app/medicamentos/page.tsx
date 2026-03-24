import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PlusCircle, AlertTriangle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function MedicamentosPage() {
  const medicamentos = await prisma.medicamento.findMany({
    where: { activo: true },
    include: {
      prescripciones: {
        where: { activa: true },
        select: { id: true, paciente: { select: { nombre: true, apellido: true, id: true } } },
      },
    },
    orderBy: { nombre: 'asc' },
  })

  const stockCritico = medicamentos.filter(m => m.stock <= m.stockMinimo)

  async function agregarMedicamento(formData: FormData) {
    'use server'
    await prisma.medicamento.create({
      data: {
        nombre: formData.get('nombre') as string,
        principioActivo: (formData.get('principioActivo') as string) || null,
        presentacion: (formData.get('presentacion') as string) || null,
        concentracion: (formData.get('concentracion') as string) || null,
        stock: parseInt(formData.get('stock') as string) || 0,
        stockMinimo: parseInt(formData.get('stockMinimo') as string) || 10,
        unidad: (formData.get('unidad') as string) || 'unidades',
        precioUnitario: parseFloat(formData.get('precioUnitario') as string) || null,
        laboratorio: (formData.get('laboratorio') as string) || null,
      },
    })
    redirect('/medicamentos')
  }

  return (
    <div className="space-y-6">
      {/* Alertas de stock */}
      {stockCritico.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm font-medium text-red-800">Stock crítico en {stockCritico.length} medicamento(s)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stockCritico.map(m => (
              <span key={m.id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {m.nombre}: {m.stock} {m.unidad} (mín: {m.stockMinimo})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Medicamentos ({medicamentos.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Medicamento</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Principio Activo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Presentación</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stock Mín.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Precio Unit.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pacientes con Rx</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {medicamentos.map((m) => {
              const bajStock = m.stock <= m.stockMinimo
              return (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.nombre}</p>
                    {m.laboratorio && <p className="text-xs text-gray-400">{m.laboratorio}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.principioActivo ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {m.presentacion ? `${m.presentacion} ${m.concentracion ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${bajStock ? 'text-red-600' : 'text-green-700'}`}>
                      {m.stock} {m.unidad}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.stockMinimo}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {m.precioUnitario ? formatCurrency(m.precioUnitario) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {m.prescripciones.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.prescripciones.slice(0, 3).map(prx => (
                          <Link
                            key={prx.id}
                            href={`/pacientes/${prx.paciente.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {prx.paciente.nombre} {prx.paciente.apellido}
                          </Link>
                        ))}
                        {m.prescripciones.length > 3 && (
                          <span className="text-xs text-gray-400">+{m.prescripciones.length - 3} más</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Ninguno</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {bajStock ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Bajo stock</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Agregar medicamento */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-green-600" /> Agregar Medicamento
        </h2>
        <form action={agregarMedicamento} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre *</label>
            <input name="nombre" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Principio Activo</label>
            <input name="principioActivo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Presentación</label>
            <select name="presentacion" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Sin especificar</option>
              <option value="COMPRIMIDO">Comprimido</option>
              <option value="CAPSULAS">Cápsulas</option>
              <option value="JARABE">Jarabe</option>
              <option value="INYECTABLE">Inyectable</option>
              <option value="SUBLINGUAL">Sublingual</option>
              <option value="PARCHE">Parche</option>
              <option value="GOTAS">Gotas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Concentración</label>
            <input name="concentracion" placeholder="Ej: 10mg, 100mg/ml" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Stock Inicial</label>
            <input name="stock" type="number" defaultValue={0} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Stock Mínimo</label>
            <input name="stockMinimo" type="number" defaultValue={10} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
            <input name="unidad" defaultValue="unidades" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unitario ($)</label>
            <input name="precioUnitario" type="number" step="0.01" min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Laboratorio</label>
            <input name="laboratorio" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
              Agregar Medicamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

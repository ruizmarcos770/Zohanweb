import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatCurrency, formatDate, CATEGORIA_GASTO_LABELS, TIPO_INGRESO_LABELS, MESES } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, PlusCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function FinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; anio?: string; tab?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const anio = parseInt(params.anio ?? String(now.getFullYear()))
  const mes = parseInt(params.mes ?? String(now.getMonth() + 1))
  const tab = params.tab ?? 'resumen'

  const startOfMonth = new Date(anio, mes - 1, 1)
  const startOfNextMonth = new Date(anio, mes, 1)

  const [ingresos, gastos, cuentasPaciente] = await Promise.all([
    prisma.ingreso.findMany({
      where: { fecha: { gte: startOfMonth, lt: startOfNextMonth } },
      include: { paciente: { select: { nombre: true, apellido: true } } },
      orderBy: { fecha: 'desc' },
    }),
    prisma.gasto.findMany({
      where: { fecha: { gte: startOfMonth, lt: startOfNextMonth } },
      orderBy: { fecha: 'desc' },
    }),
    prisma.cuentaPaciente.findMany({
      include: { paciente: { select: { nombre: true, apellido: true, estado: true } } },
      orderBy: { paciente: { apellido: 'asc' } },
    }),
  ])

  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0)
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const balance = totalIngresos - totalGastos

  // Agrupar gastos por categoría
  const gastosPorCategoria: Record<string, number> = {}
  gastos.forEach(g => {
    gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] ?? 0) + g.monto
  })

  // Agrupar ingresos por tipo
  const ingresosPorTipo: Record<string, number> = {}
  ingresos.forEach(i => {
    ingresosPorTipo[i.tipo] = (ingresosPorTipo[i.tipo] ?? 0) + i.monto
  })

  const pacientes = await prisma.paciente.findMany({
    where: { estado: 'ACTIVO' },
    select: { id: true, nombre: true, apellido: true },
    orderBy: { apellido: 'asc' },
  })

  async function registrarIngreso(formData: FormData) {
    'use server'
    const pacienteId = formData.get('pacienteId') as string
    const monto = parseFloat(formData.get('monto') as string)
    const fecha = new Date(formData.get('fecha') as string)

    let cuentaPacienteId: string | undefined
    if (pacienteId) {
      const cuenta = await prisma.cuentaPaciente.findUnique({ where: { pacienteId } })
      if (cuenta) cuentaPacienteId = cuenta.id
    }

    await prisma.ingreso.create({
      data: {
        concepto: formData.get('concepto') as string,
        monto,
        tipo: formData.get('tipo') as string,
        metodo: formData.get('metodo') as string,
        fecha,
        pacienteId: pacienteId || null,
        cuentaPacienteId: cuentaPacienteId ?? null,
        comprobante: (formData.get('comprobante') as string) || null,
        notas: (formData.get('notas') as string) || null,
      },
    })

    if (cuentaPacienteId) {
      await prisma.cuentaPaciente.update({
        where: { id: cuentaPacienteId },
        data: { saldo: { increment: monto } },
      })
    }
    redirect(`/finanzas?tab=ingresos&mes=${mes}&anio=${anio}`)
  }

  async function registrarGasto(formData: FormData) {
    'use server'
    await prisma.gasto.create({
      data: {
        concepto: formData.get('concepto') as string,
        monto: parseFloat(formData.get('monto') as string),
        categoria: formData.get('categoria') as string,
        metodo: formData.get('metodo') as string,
        fecha: new Date(formData.get('fecha') as string),
        proveedor: (formData.get('proveedor') as string) || null,
        factura: (formData.get('factura') as string) || null,
        notas: (formData.get('notas') as string) || null,
      },
    })
    redirect(`/finanzas?tab=gastos&mes=${mes}&anio=${anio}`)
  }

  const hoy = new Date().toISOString().split('T')[0]
  const mesesOptions = MESES.map((nombre, i) => ({ value: i + 1, nombre }))
  const aniosOptions = [2024, 2025, 2026, 2027]

  return (
    <div className="space-y-6">
      {/* Filtro de período */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form method="GET" className="flex items-center gap-3">
          <input type="hidden" name="tab" value={tab} />
          <label className="text-sm text-gray-600 font-medium">Período:</label>
          <select name="mes" defaultValue={mes} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {mesesOptions.map(m => (
              <option key={m.value} value={m.value}>{m.nombre}</option>
            ))}
          </select>
          <select name="anio" defaultValue={anio} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {aniosOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">Aplicar</button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIngresos)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ingresos.length} transacciones</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={22} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{gastos.length} transacciones</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={22} className="text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
              <p className={`text-xs mt-0.5 ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {balance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {[
            { key: 'resumen', label: 'Resumen' },
            { key: 'ingresos', label: `Ingresos (${ingresos.length})` },
            { key: 'gastos', label: `Gastos (${gastos.length})` },
            { key: 'cuentas', label: 'Cuentas Pacientes' },
          ].map(t => (
            <Link
              key={t.key}
              href={`/finanzas?tab=${t.key}&mes=${mes}&anio=${anio}`}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'resumen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingresos por tipo */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Ingresos por Tipo</h3>
            <div className="space-y-3">
              {Object.entries(ingresosPorTipo).map(([tipo, monto]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{TIPO_INGRESO_LABELS[tipo] ?? tipo}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-green-200 rounded-full" style={{ width: `${(monto / totalIngresos) * 100}px` }} />
                    <span className="text-sm font-medium text-gray-900 w-28 text-right">{formatCurrency(monto)}</span>
                  </div>
                </div>
              ))}
              {Object.keys(ingresosPorTipo).length === 0 && (
                <p className="text-sm text-gray-400">Sin ingresos en este período</p>
              )}
            </div>
          </div>
          {/* Gastos por categoría */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
            <div className="space-y-3">
              {Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, monto]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{CATEGORIA_GASTO_LABELS[cat] ?? cat}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-red-200 rounded-full" style={{ width: totalGastos > 0 ? `${(monto / totalGastos) * 100}px` : '0px' }} />
                    <span className="text-sm font-medium text-gray-900 w-28 text-right">{formatCurrency(monto)}</span>
                  </div>
                </div>
              ))}
              {Object.keys(gastosPorCategoria).length === 0 && (
                <p className="text-sm text-gray-400">Sin gastos en este período</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'ingresos' && (
        <div className="space-y-4">
          {/* Formulario nuevo ingreso */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <PlusCircle size={16} className="text-green-600" /> Registrar Ingreso
            </h3>
            <form action={registrarIngreso} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Concepto *</label>
                <input name="concepto" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monto ($) *</label>
                <input name="monto" type="number" step="0.01" min={0} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo *</label>
                <select name="tipo" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {Object.entries(TIPO_INGRESO_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Método</label>
                <select name="metodo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="DEBITO_AUTOMATICO">Débito Automático</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Paciente</label>
                <select name="pacienteId" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">General / Sin paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                <input name="fecha" type="date" defaultValue={hoy} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Comprobante</label>
                <input name="comprobante" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <input name="notas" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  Registrar Ingreso
                </button>
              </div>
            </form>
          </div>

          {/* Lista */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Método</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((i) => (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(i.fecha)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{i.concepto}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {i.paciente ? `${i.paciente.nombre} ${i.paciente.apellido}` : '—'}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{TIPO_INGRESO_LABELS[i.tipo] ?? i.tipo}</span></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{i.metodo.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(i.monto)}</td>
                  </tr>
                ))}
                {ingresos.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin ingresos en este período</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'gastos' && (
        <div className="space-y-4">
          {/* Formulario nuevo gasto */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <PlusCircle size={16} className="text-red-500" /> Registrar Gasto
            </h3>
            <form action={registrarGasto} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Concepto *</label>
                <input name="concepto" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Monto ($) *</label>
                <input name="monto" type="number" step="0.01" min={0} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Categoría *</label>
                <select name="categoria" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  {Object.entries(CATEGORIA_GASTO_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
                <input name="proveedor" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">N° Factura</label>
                <input name="factura" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Método</label>
                <select name="metodo" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DEBITO_AUTOMATICO">Débito Automático</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                <input name="fecha" type="date" defaultValue={hoy} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <input name="notas" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>

          {/* Lista */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Factura</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(g.fecha)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{g.concepto}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{CATEGORIA_GASTO_LABELS[g.categoria] ?? g.categoria}</span></td>
                    <td className="px-4 py-3 text-gray-600">{g.proveedor ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{g.factura ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(g.monto)}</td>
                  </tr>
                ))}
                {gastos.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin gastos en este período</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'cuentas' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Paciente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Saldo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cuentasPaciente.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.paciente.nombre} {c.paciente.apellido}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.paciente.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.paciente.estado}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold text-lg ${c.saldo >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {formatCurrency(c.saldo)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/pacientes/${c.pacienteId}`} className="text-xs text-blue-600 hover:underline">Ver ficha</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

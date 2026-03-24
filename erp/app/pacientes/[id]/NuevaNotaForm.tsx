'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaNotaForm({ pacienteId }: { pacienteId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = {
      pacienteId,
      tipo: (form.elements.namedItem('tipo') as HTMLSelectElement).value,
      contenido: (form.elements.namedItem('contenido') as HTMLTextAreaElement).value,
    }
    await fetch('/api/notas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    setOpen(false)
    form.reset()
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
      >
        + Nueva nota de evolución
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-3">
      <div className="flex gap-3">
        <select
          name="tipo"
          required
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="GENERAL">General</option>
          <option value="MEDICA">Médica</option>
          <option value="PSICOLOGICA">Psicológica</option>
          <option value="ENFERMERIA">Enfermería</option>
        </select>
      </div>
      <textarea
        name="contenido"
        required
        rows={3}
        placeholder="Escribir nota de evolución..."
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar nota'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

import { useState, useRef, useEffect } from 'react'

/**
 * Select + botón para agregar categoría nueva al vuelo.
 * El input de nueva categoría aparece DEBAJO del select (no lo reemplaza),
 * evitando conflictos con el submit del formulario padre.
 */
export default function SelectConNueva({ value, onChange, options, onAddOption }) {
  const [agregando, setAgregando] = useState(false)
  const [nueva, setNueva] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (agregando && inputRef.current) inputRef.current.focus()
  }, [agregando])

  const handleConfirm = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    const trimmed = nueva.trim()
    if (!trimmed) return
    onAddOption(trimmed)
    onChange(trimmed)
    setNueva('')
    setAgregando(false)
  }

  const handleCancel = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    setNueva('')
    setAgregando(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleConfirm() }
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className="space-y-1.5">
      {/* Select normal */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      {/* Botón "Nueva categoría" o input */}
      {!agregando ? (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          ＋ Nueva categoría
        </button>
      ) : (
        <div className="flex gap-1">
          <input
            ref={inputRef}
            type="text"
            value={nueva}
            onChange={e => setNueva(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nombre de categoría..."
            className="flex-1 border border-blue-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="border border-gray-300 text-gray-500 px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

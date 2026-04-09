import { useState } from 'react'

/**
 * Select con opción de crear categoría nueva al vuelo.
 * Props:
 *   value, onChange, options (string[]),
 *   onAddOption(newCat) — llama al padre para persistir,
 *   placeholder
 */
export default function SelectConNueva({ value, onChange, options, onAddOption, placeholder = 'Seleccionar' }) {
  const [agregando, setAgregando] = useState(false)
  const [nueva, setNueva] = useState('')

  const handleSelect = (e) => {
    if (e.target.value === '__nueva__') {
      setAgregando(true)
    } else {
      onChange(e.target.value)
    }
  }

  const handleConfirm = () => {
    const trimmed = nueva.trim()
    if (!trimmed) return
    onAddOption(trimmed)
    onChange(trimmed)
    setNueva('')
    setAgregando(false)
  }

  if (agregando) {
    return (
      <div className="flex gap-1">
        <input
          autoFocus
          value={nueva}
          onChange={e => setNueva(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') setAgregando(false) }}
          placeholder="Nueva categoría..."
          className="flex-1 border border-blue-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" onClick={handleConfirm}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          ✓
        </button>
        <button type="button" onClick={() => { setAgregando(false); setNueva('') }}
          className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
          ✕
        </button>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={handleSelect}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {placeholder && !value && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__nueva__">＋ Nueva categoría...</option>
    </select>
  )
}

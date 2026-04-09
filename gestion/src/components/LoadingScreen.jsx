export default function LoadingScreen({ error }) {
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-sm w-full text-center shadow-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Error de conexión</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <p className="text-xs text-gray-400">Verificá las variables de entorno de Supabase y recargá la página.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Cargando datos...</p>
    </div>
  )
}

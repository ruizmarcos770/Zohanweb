import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { hasDB } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Ventas from './components/Ventas'
import Vendedores from './components/Vendedores'
import Comisiones from './components/Comisiones'
import Gastos from './components/Gastos'
import Reportes from './components/Reportes'
import LoadingScreen from './components/LoadingScreen'

function Pages({ page, setPage }) {
  switch (page) {
    case 'dashboard':  return <Dashboard setPage={setPage} />
    case 'inventario': return <Inventario />
    case 'ventas':     return <Ventas />
    case 'vendedores': return <Vendedores />
    case 'comisiones': return <Comisiones />
    case 'gastos':     return <Gastos />
    case 'reportes':   return <Reportes />
    default:           return <Dashboard setPage={setPage} />
  }
}

function AppContent() {
  const { state } = useApp()
  const [page, setPage] = useState('dashboard')

  if (state.loading) return <LoadingScreen />
  if (state.error)   return <LoadingScreen error={state.error} />

  return (
    <Layout page={page} setPage={setPage} dbMode={hasDB}>
      <Pages page={page} setPage={setPage} />
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

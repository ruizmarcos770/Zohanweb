import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Ventas from './components/Ventas'
import Vendedores from './components/Vendedores'
import Comisiones from './components/Comisiones'
import Gastos from './components/Gastos'
import Reportes from './components/Reportes'

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

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <AppProvider>
      <Layout page={page} setPage={setPage}>
        <Pages page={page} setPage={setPage} />
      </Layout>
    </AppProvider>
  )
}

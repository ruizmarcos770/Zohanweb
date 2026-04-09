import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

// ── Initial demo data ────────────────────────────────────────────────────────
const DEMO_VENDEDORES = [
  { id: 'v1', nombre: 'Lucas Pérez', email: 'lucas@empresa.com', telefono: '351-111-2222', comision: 5 },
  { id: 'v2', nombre: 'Sofía García', email: 'sofia@empresa.com', telefono: '351-333-4444', comision: 7 },
]

const DEMO_PRODUCTOS = [
  { id: 'p1', codigo: 'EQ-001', nombre: 'Mancuernas 10kg par', descripcion: 'Par de mancuernas de hierro fundido', precioCompra: 8000, precioVenta: 15000, stock: 20, stockMinimo: 5, categoria: 'Equipamiento' },
  { id: 'p2', codigo: 'EQ-002', nombre: 'Bicicleta estática', descripcion: 'Bicicleta fija con resistencia magnética', precioCompra: 45000, precioVenta: 89000, stock: 4, stockMinimo: 2, categoria: 'Equipamiento' },
  { id: 'p3', codigo: 'EQ-003', nombre: 'Banda elástica fuerte', descripcion: 'Banda de resistencia alta intensidad', precioCompra: 1500, precioVenta: 3500, stock: 50, stockMinimo: 10, categoria: 'Accesorios' },
  { id: 'p4', codigo: 'EQ-004', nombre: 'Colchoneta yoga', descripcion: 'Colchoneta antideslizante 6mm', precioCompra: 3000, precioVenta: 6500, stock: 3, stockMinimo: 5, categoria: 'Accesorios' },
]

const INITIAL_CATS_PRODUCTO = [
  'Estribos', 'Enganches', 'Cobertor', 'Barra antivuelco', 'Tapa rígida',
  'Lona', 'Defensa', 'Amortiguador de portón', 'Polarizado', 'Cubrealfombras',
  'Barras y baúles portaequipaje', 'Fundas',
]

const INITIAL_CATS_GASTO = [
  'Alquiler', 'Servicios', 'Sueldos', 'Proveedores', 'Marketing',
  'Mantenimiento', 'Impuestos', 'Logística', 'Colocación', 'Otros',
]

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    // Categorías
    case 'ADD_CATEGORIA_PRODUCTO':
      if (state.categoriasProducto.includes(action.payload)) return state
      return { ...state, categoriasProducto: [...state.categoriasProducto, action.payload] }
    case 'DELETE_CATEGORIA_PRODUCTO':
      return { ...state, categoriasProducto: state.categoriasProducto.filter(c => c !== action.payload) }
    case 'ADD_CATEGORIA_GASTO':
      if (state.categoriasGasto.includes(action.payload)) return state
      return { ...state, categoriasGasto: [...state.categoriasGasto, action.payload] }
    case 'DELETE_CATEGORIA_GASTO':
      return { ...state, categoriasGasto: state.categoriasGasto.filter(c => c !== action.payload) }

    // Productos
    case 'ADD_PRODUCTO':
      return { ...state, productos: [...state.productos, action.payload] }
    case 'UPDATE_PRODUCTO':
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUCTO':
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload) }

    // Vendedores
    case 'ADD_VENDEDOR':
      return { ...state, vendedores: [...state.vendedores, action.payload] }
    case 'UPDATE_VENDEDOR':
      return { ...state, vendedores: state.vendedores.map(v => v.id === action.payload.id ? action.payload : v) }
    case 'DELETE_VENDEDOR':
      return { ...state, vendedores: state.vendedores.filter(v => v.id !== action.payload) }

    // Ventas
    case 'ADD_VENTA': {
      // Descontar stock
      const updatedProductos = state.productos.map(prod => {
        const item = action.payload.items.find(i => i.productoId === prod.id)
        if (item) return { ...prod, stock: prod.stock - item.cantidad }
        return prod
      })
      return {
        ...state,
        ventas: [...state.ventas, action.payload],
        productos: updatedProductos,
      }
    }
    case 'CANCEL_VENTA': {
      const venta = state.ventas.find(v => v.id === action.payload)
      if (!venta || venta.estado === 'cancelada') return state
      // Reponer stock
      const updatedProductos = state.productos.map(prod => {
        const item = venta.items.find(i => i.productoId === prod.id)
        if (item) return { ...prod, stock: prod.stock + item.cantidad }
        return prod
      })
      return {
        ...state,
        ventas: state.ventas.map(v => v.id === action.payload ? { ...v, estado: 'cancelada' } : v),
        productos: updatedProductos,
      }
    }

    // Gastos
    case 'ADD_GASTO':
      return { ...state, gastos: [...state.gastos, action.payload] }
    case 'UPDATE_GASTO':
      return { ...state, gastos: state.gastos.map(g => g.id === action.payload.id ? action.payload : g) }
    case 'DELETE_GASTO':
      return { ...state, gastos: state.gastos.filter(g => g.id !== action.payload) }

    // Comisiones: marcar pagada
    case 'PAGAR_COMISION':
      return {
        ...state,
        ventas: state.ventas.map(v =>
          v.id === action.payload
            ? { ...v, comisionPagada: true, comisionFechaPago: new Date().toISOString() }
            : v
        ),
      }

    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem('gestion_data')
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return {
      productos: DEMO_PRODUCTOS,
      vendedores: DEMO_VENDEDORES,
      ventas: [],
      gastos: [],
      categoriasProducto: INITIAL_CATS_PRODUCTO,
      categoriasGasto: INITIAL_CATS_GASTO,
    }
  })

  // Persist on every change
  useEffect(() => {
    localStorage.setItem('gestion_data', JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function formatCurrency(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_debito', label: 'Tarjeta débito' },
  { value: 'tarjeta_credito', label: 'Tarjeta crédito' },
  { value: 'transferencia', label: 'Transferencia' },
]


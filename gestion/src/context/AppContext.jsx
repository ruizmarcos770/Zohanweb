import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { hasDB } from '../lib/supabase'
import * as db from '../lib/db'

const AppContext = createContext(null)

// ── Categorías por defecto (usadas en modo offline) ───────────────────────────
const INITIAL_CATS_PRODUCTO = [
  'Estribos', 'Enganches', 'Cobertor', 'Barra antivuelco', 'Tapa rígida',
  'Lona', 'Defensa', 'Amortiguador de portón', 'Polarizado', 'Cubrealfombras',
  'Barras y baúles portaequipaje', 'Fundas',
]

const INITIAL_CATS_GASTO = [
  'Alquiler', 'Servicios', 'Sueldos', 'Proveedores', 'Marketing',
  'Mantenimiento', 'Impuestos', 'Logística', 'Colocación', 'Otros',
]

const INITIAL_STATE = {
  loading: true,
  error: null,
  productos: [],
  vendedores: [],
  ventas: [],
  gastos: [],
  categoriasProducto: INITIAL_CATS_PRODUCTO,
  categoriasGasto: INITIAL_CATS_GASTO,
}

// ── Reducer (maneja estado local) ─────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'LOAD_ALL':
      return {
        ...state,
        loading: false,
        error: null,
        productos: action.payload.productos,
        vendedores: action.payload.vendedores,
        ventas: action.payload.ventas,
        gastos: action.payload.gastos,
        categoriasProducto: action.payload.categoriasProducto,
        categoriasGasto: action.payload.categoriasGasto,
      }

    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload }

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

    // Comisiones
    case 'PAGAR_COMISION':
      return {
        ...state,
        ventas: state.ventas.map(v =>
          v.id === action.payload
            ? { ...v, comisionPagada: true, comisionFechaPago: new Date().toISOString() }
            : v
        ),
      }

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

    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, localDispatch] = useReducer(reducer, INITIAL_STATE)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasDB) {
      loadFromSupabase()
    } else {
      loadFromLocalStorage()
    }
  }, [])

  async function loadFromSupabase() {
    try {
      const [productos, vendedores, ventas, gastos, categorias] = await Promise.all([
        db.getProductos(),
        db.getVendedores(),
        db.getVentas(),
        db.getGastos(),
        db.getCategorias(),
      ])
      localDispatch({
        type: 'LOAD_ALL',
        payload: {
          productos, vendedores, ventas, gastos,
          categoriasProducto: categorias.producto.length ? categorias.producto : INITIAL_CATS_PRODUCTO,
          categoriasGasto: categorias.gasto.length ? categorias.gasto : INITIAL_CATS_GASTO,
        },
      })
    } catch (err) {
      console.error('Error cargando datos:', err)
      localDispatch({ type: 'SET_ERROR', payload: 'No se pudo conectar con la base de datos.' })
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('gestion_data')
      if (saved) {
        const parsed = JSON.parse(saved)
        localDispatch({
          type: 'LOAD_ALL',
          payload: {
            productos: parsed.productos || [],
            vendedores: parsed.vendedores || [],
            ventas: parsed.ventas || [],
            gastos: parsed.gastos || [],
            categoriasProducto: parsed.categoriasProducto || INITIAL_CATS_PRODUCTO,
            categoriasGasto: parsed.categoriasGasto || INITIAL_CATS_GASTO,
          },
        })
      } else {
        localDispatch({
          type: 'LOAD_ALL',
          payload: {
            productos: [], vendedores: [], ventas: [], gastos: [],
            categoriasProducto: INITIAL_CATS_PRODUCTO,
            categoriasGasto: INITIAL_CATS_GASTO,
          },
        })
      }
    } catch {
      localDispatch({ type: 'SET_ERROR', payload: 'Error al cargar datos locales.' })
    }
  }

  // ── Persistencia offline (localStorage) ──────────────────────────────────────
  useEffect(() => {
    if (!hasDB && !state.loading) {
      const { loading, error, ...data } = state
      localStorage.setItem('gestion_data', JSON.stringify(data))
    }
  }, [state])

  // ── Sync a Supabase (optimistic: actualiza local primero, luego sincroniza) ──
  const syncToSupabase = useCallback(async (action) => {
    if (!hasDB) return
    const s = stateRef.current
    try {
      switch (action.type) {

        case 'ADD_PRODUCTO':
        case 'UPDATE_PRODUCTO':
          await db.upsertProducto(action.payload)
          break
        case 'DELETE_PRODUCTO':
          await db.deleteProducto(action.payload)
          break

        case 'ADD_VENDEDOR':
        case 'UPDATE_VENDEDOR':
          await db.upsertVendedor(action.payload)
          break
        case 'DELETE_VENDEDOR':
          await db.deleteVendedor(action.payload)
          break

        case 'ADD_VENTA': {
          await db.upsertVenta(action.payload)
          // Sincronizar stock actualizado de productos
          const updatedProds = s.productos.filter(p =>
            action.payload.items.some(i => i.productoId === p.id)
          )
          await Promise.all(updatedProds.map(p => db.upsertProducto(p)))
          break
        }
        case 'CANCEL_VENTA': {
          const venta = s.ventas.find(v => v.id === action.payload)
          if (venta) await db.upsertVenta({ ...venta, estado: 'cancelada' })
          // Reponer stock en DB
          const reposProds = s.productos.filter(p =>
            venta?.items.some(i => i.productoId === p.id)
          )
          await Promise.all(reposProds.map(p => db.upsertProducto(p)))
          break
        }

        case 'ADD_GASTO':
        case 'UPDATE_GASTO':
          await db.upsertGasto(action.payload)
          break
        case 'DELETE_GASTO':
          await db.deleteGasto(action.payload)
          break

        case 'PAGAR_COMISION': {
          const venta = s.ventas.find(v => v.id === action.payload)
          if (venta) {
            await db.upsertVenta({
              ...venta,
              comisionPagada: true,
              comisionFechaPago: new Date().toISOString(),
            })
          }
          break
        }

        case 'ADD_CATEGORIA_PRODUCTO':
          await db.addCategoria('producto', action.payload)
          break
        case 'DELETE_CATEGORIA_PRODUCTO':
          await db.deleteCategoria('producto', action.payload)
          break
        case 'ADD_CATEGORIA_GASTO':
          await db.addCategoria('gasto', action.payload)
          break
        case 'DELETE_CATEGORIA_GASTO':
          await db.deleteCategoria('gasto', action.payload)
          break
      }
    } catch (err) {
      console.error('Error sincronizando:', action.type, err)
    }
  }, [])

  // dispatch unificado: actualiza local + sincroniza DB
  const dispatch = useCallback((action) => {
    localDispatch(action)
    syncToSupabase(action)
  }, [syncToSupabase])

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

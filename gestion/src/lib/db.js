import { supabase } from './supabase'

// ── Mappers camelCase ↔ snake_case ───────────────────────────────────────────

function toProducto(r) {
  return {
    id: r.id, codigo: r.codigo || '', nombre: r.nombre,
    descripcion: r.descripcion || '',
    precioCompra: Number(r.precio_compra) || 0,
    precioVenta: Number(r.precio_venta) || 0,
    stock: Number(r.stock) || 0,
    stockMinimo: Number(r.stock_minimo) || 0,
    categoria: r.categoria || '',
  }
}
function fromProducto(p) {
  return {
    id: p.id, codigo: p.codigo, nombre: p.nombre,
    descripcion: p.descripcion,
    precio_compra: p.precioCompra, precio_venta: p.precioVenta,
    stock: p.stock, stock_minimo: p.stockMinimo,
    categoria: p.categoria,
  }
}

function toVendedor(r) {
  return {
    id: r.id, nombre: r.nombre, email: r.email || '',
    telefono: r.telefono || '', comision: Number(r.comision) || 0,
  }
}
function fromVendedor(v) {
  return { id: v.id, nombre: v.nombre, email: v.email, telefono: v.telefono, comision: v.comision }
}

function toVenta(r) {
  return {
    id: r.id, numero: r.numero, fecha: r.fecha,
    clienteNombre: r.cliente_nombre || '',
    vendedorId: r.vendedor_id || '',
    items: r.items || [],
    subtotal: Number(r.subtotal) || 0,
    descuento: Number(r.descuento) || 0,
    total: Number(r.total) || 0,
    metodoPago: r.metodo_pago || 'efectivo',
    comisionMonto: Number(r.comision_monto) || 0,
    comisionPagada: r.comision_pagada || false,
    comisionFechaPago: r.comision_fecha_pago || null,
    estado: r.estado || 'completada',
  }
}
function fromVenta(v) {
  return {
    id: v.id, numero: v.numero, fecha: v.fecha,
    cliente_nombre: v.clienteNombre, vendedor_id: v.vendedorId || null,
    items: v.items, subtotal: v.subtotal, descuento: v.descuento,
    total: v.total, metodo_pago: v.metodoPago,
    comision_monto: v.comisionMonto,
    comision_pagada: v.comisionPagada,
    comision_fecha_pago: v.comisionFechaPago || null,
    estado: v.estado,
  }
}

function toGasto(r) {
  return {
    id: r.id, fecha: r.fecha, descripcion: r.descripcion,
    categoria: r.categoria || '', monto: Number(r.monto) || 0,
    metodoPago: r.metodo_pago || 'efectivo', notas: r.notas || '',
  }
}
function fromGasto(g) {
  return {
    id: g.id, fecha: g.fecha, descripcion: g.descripcion,
    categoria: g.categoria, monto: g.monto,
    metodo_pago: g.metodoPago, notas: g.notas,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function query(promise) {
  const { data, error } = await promise
  if (error) throw error
  return data
}

// ── Productos ─────────────────────────────────────────────────────────────────

export async function getProductos() {
  const rows = await query(supabase.from('productos').select('*').order('nombre'))
  return rows.map(toProducto)
}

export async function upsertProducto(p) {
  await query(supabase.from('productos').upsert(fromProducto(p)))
}

export async function deleteProducto(id) {
  await query(supabase.from('productos').delete().eq('id', id))
}

// ── Vendedores ────────────────────────────────────────────────────────────────

export async function getVendedores() {
  const rows = await query(supabase.from('vendedores').select('*').order('nombre'))
  return rows.map(toVendedor)
}

export async function upsertVendedor(v) {
  await query(supabase.from('vendedores').upsert(fromVendedor(v)))
}

export async function deleteVendedor(id) {
  await query(supabase.from('vendedores').delete().eq('id', id))
}

// ── Ventas ────────────────────────────────────────────────────────────────────

export async function getVentas() {
  const rows = await query(supabase.from('ventas').select('*').order('fecha', { ascending: false }))
  return rows.map(toVenta)
}

export async function upsertVenta(v) {
  await query(supabase.from('ventas').upsert(fromVenta(v)))
}

// ── Gastos ────────────────────────────────────────────────────────────────────

export async function getGastos() {
  const rows = await query(supabase.from('gastos').select('*').order('fecha', { ascending: false }))
  return rows.map(toGasto)
}

export async function upsertGasto(g) {
  await query(supabase.from('gastos').upsert(fromGasto(g)))
}

export async function deleteGasto(id) {
  await query(supabase.from('gastos').delete().eq('id', id))
}

// ── Categorías ────────────────────────────────────────────────────────────────

export async function getCategorias() {
  const rows = await query(supabase.from('categorias').select('*').order('nombre'))
  const producto = rows.filter(r => r.tipo === 'producto').map(r => r.nombre)
  const gasto = rows.filter(r => r.tipo === 'gasto').map(r => r.nombre)
  return { producto, gasto }
}

export async function addCategoria(tipo, nombre) {
  await query(supabase.from('categorias').upsert({ tipo, nombre }))
}

export async function deleteCategoria(tipo, nombre) {
  await query(supabase.from('categorias').delete().eq('tipo', tipo).eq('nombre', nombre))
}

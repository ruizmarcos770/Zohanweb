-- ============================================================
--  Sistema de Gestión — Script de creación de tablas
--  Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS productos (
  id            text PRIMARY KEY,
  codigo        text DEFAULT '',
  nombre        text NOT NULL,
  descripcion   text DEFAULT '',
  precio_compra numeric DEFAULT 0,
  precio_venta  numeric DEFAULT 0,
  stock         integer DEFAULT 0,
  stock_minimo  integer DEFAULT 0,
  categoria     text DEFAULT '',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendedores (
  id         text PRIMARY KEY,
  nombre     text NOT NULL,
  email      text DEFAULT '',
  telefono   text DEFAULT '',
  comision   numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ventas (
  id                  text PRIMARY KEY,
  numero              text,
  fecha               timestamptz,
  cliente_nombre      text DEFAULT '',
  vendedor_id         text,
  items               jsonb DEFAULT '[]',
  subtotal            numeric DEFAULT 0,
  descuento           numeric DEFAULT 0,
  total               numeric DEFAULT 0,
  metodo_pago         text DEFAULT 'efectivo',
  comision_monto      numeric DEFAULT 0,
  comision_pagada     boolean DEFAULT false,
  comision_fecha_pago timestamptz,
  estado              text DEFAULT 'completada',
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gastos (
  id          text PRIMARY KEY,
  fecha       date,
  descripcion text NOT NULL,
  categoria   text DEFAULT '',
  monto       numeric DEFAULT 0,
  metodo_pago text DEFAULT 'efectivo',
  notas       text DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id     serial PRIMARY KEY,
  tipo   text NOT NULL,   -- 'producto' | 'gasto'
  nombre text NOT NULL,
  UNIQUE (tipo, nombre)
);

-- ── Row Level Security (acceso público, agregar auth después si se necesita) ──

ALTER TABLE productos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON productos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON vendedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON ventas     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON gastos     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON categorias FOR ALL USING (true) WITH CHECK (true);

-- ── Categorías iniciales ───────────────────────────────────────────────────────

INSERT INTO categorias (tipo, nombre) VALUES
  ('producto', 'Estribos'),
  ('producto', 'Enganches'),
  ('producto', 'Cobertor'),
  ('producto', 'Barra antivuelco'),
  ('producto', 'Tapa rígida'),
  ('producto', 'Lona'),
  ('producto', 'Defensa'),
  ('producto', 'Amortiguador de portón'),
  ('producto', 'Polarizado'),
  ('producto', 'Cubrealfombras'),
  ('producto', 'Barras y baúles portaequipaje'),
  ('producto', 'Fundas'),
  ('gasto', 'Alquiler'),
  ('gasto', 'Servicios'),
  ('gasto', 'Sueldos'),
  ('gasto', 'Proveedores'),
  ('gasto', 'Marketing'),
  ('gasto', 'Mantenimiento'),
  ('gasto', 'Impuestos'),
  ('gasto', 'Logística'),
  ('gasto', 'Colocación'),
  ('gasto', 'Otros')
ON CONFLICT (tipo, nombre) DO NOTHING;

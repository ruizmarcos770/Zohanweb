# 🏠 SISTEMA COMPLETO PROVEEDOR 3 - GOOGLE DRIVE + PRICING AUTOMATIZADO
# Sistema especializado para proveedor de cobertores
# INCLUYE: IVA sobre rentabilidad (21% sobre ganancia) + DETECCIÓN AUTOMÁTICA
# CATEGORÍA PRINCIPAL: cobertores

import pandas as pd
import numpy as np
from datetime import datetime
import os
import re
from typing import Dict, List, Tuple

# Imports para Google Drive
try:
    from googleapiclient.discovery import build
    from google.oauth2 import service_account
    import io
    from googleapiclient.http import MediaIoBaseDownload
    DRIVE_AVAILABLE = True
except ImportError:
    DRIVE_AVAILABLE = False

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

class Proveedor3PricingSystem:
    """Sistema completo automatizado para Proveedor 3 - Cobertores"""

    def __init__(self):
        # ID de carpeta específico para este proveedor
        self.folder_id = "1NlvYFqUL9qh7kfhPZneUbtfhzv7WFZz2"  # Carpeta actualizada
        self.credentials_file = "service_account_credentials.json"
        self.service = None

        # Mapeo automático de categorías por nombre de archivo
        self.category_mapping = {
            'cobertores': 'cobertores',
            'cobertor': 'cobertores',
            'fundas': 'cobertores',
            'funda': 'cobertores',
            'carpas': 'cobertores',
            'carpa': 'cobertores',
            'lona': 'cobertores',
            'lonas': 'cobertores',
            'proteccion': 'cobertores',
            'cubierta': 'cobertores',
            'cubiertas': 'cobertores',
            'impermeable': 'cobertores',
            'impermeables': 'cobertores',
            'toldo': 'cobertores',
            'toldos': 'cobertores',
            'vinilo': 'cobertores',
            'vinilos': 'cobertores',
            'pvc': 'cobertores',
            'canvas': 'cobertores',
            'oxford': 'cobertores',
            'polyester': 'cobertores',
            'poliester': 'cobertores'
        }

        # Configuración pricing para cobertores
        self.ml_commissions = {
            'cobertores': 0.145,            # 14.5%
            'default': 0.145               # 14.5%
        }

        # Costos de envío
        self.shipping_costs = {
            'cobertores': 40000,            # Según especificación
            'default': 40000                # Default igual
        }

        # Costos de cuotas ML
        self.cuotas_costs = {
            'sin_cuotas': 0.0,        # 0% para ML sin cuotas
            '3_cuotas': 0.118,        # 9.5%
            '6_cuotas': 0.195,        # 15.4%
            '12_cuotas': 0.350,       # 27.4%
            'cuotas_bajas': 0.04      # ML_SinCuotas 0%
        }

        # Costos financieros
        self.costos_financieros_venta = 0.05  # 5%
        self.costo_operativo = 2500
        self.factor_iva = 1.1525  # 15.25%
        self.iva_sobre_rentabilidad = 0.21  # 21% IVA sobre ganancia

    def authenticate_drive(self):
        """Autenticar con Google Drive"""
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.credentials_file,
                scopes=['https://www.googleapis.com/auth/drive.readonly']
            )
            self.service = build('drive', 'v3', credentials=credentials)
            return True
        except Exception as e:
            print(f"❌ Error conectando Drive: {e}")
            return False

    def detect_category_from_filename(self, filename: str) -> str:
        """Detectar categoría automáticamente del nombre del archivo"""
        filename_lower = filename.lower()

        for keyword, category in self.category_mapping.items():
            if keyword in filename_lower:
                return category

        return 'cobertores'  # Default a cobertores para este proveedor

    def detect_column_structure(self, df: pd.DataFrame, start_row: int) -> Tuple[int, int, int]:
        """Detectar automáticamente las columnas de código, descripción y precio"""
        sample_rows = min(5, len(df) - start_row)

        for col_offset in range(min(3, len(df.columns))):
            codigo_col = col_offset
            desc_col = col_offset + 1
            precio_col = col_offset + 2

            if precio_col >= len(df.columns):
                continue

            valid_rows = 0
            for i in range(start_row, start_row + sample_rows):
                if i >= len(df):
                    break

                row = df.iloc[i]
                codigo = row.iloc[codigo_col] if codigo_col < len(row) and pd.notna(row.iloc[codigo_col]) else None
                precio = row.iloc[precio_col] if precio_col < len(row) and pd.notna(row.iloc[precio_col]) else None

                if codigo and precio:
                    try:
                        precio_num = float(precio)
                        if precio_num > 0 and str(codigo).strip() != '':
                            valid_rows += 1
                    except:
                        pass

            if valid_rows >= min(3, sample_rows):
                return codigo_col, desc_col, precio_col

        return 1, 2, 3

    def calculate_smart_suggestions(self, df_products: pd.DataFrame) -> Dict[str, float]:
        """Calcular sugerencias automáticas basadas en 12% de ganancia final"""
        target_margin = 0.12
        suggestions = {}

        for categoria in df_products['CATEGORIA'].unique():
            df_cat = df_products[df_products['CATEGORIA'] == categoria]

            if len(df_cat) == 0:
                continue

            comision_ml = self.ml_commissions.get(categoria, self.ml_commissions['default'])
            costo_envio = self.shipping_costs.get(categoria, self.shipping_costs['default'])

            costos_base = []
            for _, row in df_cat.iterrows():
                precio_real_pagar = row['PRECIO_NETO'] * self.factor_iva
                costo_base_total = precio_real_pagar + costo_envio + self.costo_operativo
                costos_base.append(costo_base_total)

            costo_base_promedio = np.mean(costos_base)

            mejor_ganancia = 0
            precio_objetivo = costo_base_promedio * 1.5

            for _ in range(50):
                costos_sobre_venta = comision_ml + self.cuotas_costs['3_cuotas'] + self.costos_financieros_venta
                ingresos_netos = precio_objetivo * (1 - costos_sobre_venta)
                ganancia_bruta = ingresos_netos - costo_base_promedio

                if ganancia_bruta > 0:
                    iva_sobre_ganancia = ganancia_bruta * self.iva_sobre_rentabilidad
                    ganancia_final = ganancia_bruta - iva_sobre_ganancia
                    margen_actual = ganancia_final / precio_objetivo

                    if abs(margen_actual - target_margin) < 0.001:
                        mejor_ganancia = ganancia_final
                        break

                    if margen_actual < target_margin:
                        precio_objetivo *= 1.02
                    else:
                        precio_objetivo *= 0.98

                    mejor_ganancia = ganancia_final
                else:
                    precio_objetivo *= 1.1

            suggestions[categoria] = max(10000, round(mejor_ganancia / 5000) * 5000)

        return suggestions

    def download_and_parse_excel(self, file_id: str, filename: str) -> pd.DataFrame:
        """Descargar y parsear archivo Excel del Proveedor 3"""
        try:
            request = self.service.files().get_media(fileId=file_id)
            file_io = io.BytesIO()
            downloader = MediaIoBaseDownload(file_io, request)

            done = False
            while done is False:
                status, done = downloader.next_chunk()

            file_io.seek(0)

            df = pd.read_excel(file_io, header=None)

            start_row = 0
            for i in range(min(10, len(df))):
                row_str = " ".join([str(x) for x in df.iloc[i].values if pd.notna(x)]).upper()
                if 'CODIGO' in row_str and ('VENTA' in row_str or 'DESCRIPCION' in row_str or 'PRECIO' in row_str):
                    start_row = i + 1
                    break

            if start_row == 0:
                start_row = 4

            codigo_col, desc_col, precio_col = self.detect_column_structure(df, start_row)

            productos = []
            for i in range(start_row, len(df)):
                row = df.iloc[i]

                if len(row) > max(codigo_col, desc_col, precio_col):
                    codigo = row.iloc[codigo_col] if pd.notna(row.iloc[codigo_col]) else None
                    descripcion = row.iloc[desc_col] if pd.notna(row.iloc[desc_col]) else None
                    precio = row.iloc[precio_col] if pd.notna(row.iloc[precio_col]) else None

                    if (codigo and descripcion and precio and
                        str(codigo).strip() != '' and
                        str(descripcion).strip() != '' and
                        not str(codigo).upper().startswith(('CODIGO', 'CATEGORIA', 'TIPO', 'MARCA', 'MODELO'))):

                        try:
                            precio_num = float(precio)
                            if precio_num > 0:
                                productos.append({
                                    'CODIGO': str(codigo).strip(),
                                    'DESCRIPCION': str(descripcion).strip(),
                                    'PRECIO_NETO': precio_num
                                })
                        except:
                            continue

            if len(productos) == 0:
                return pd.DataFrame()

            df_clean = pd.DataFrame(productos)
            categoria = self.detect_category_from_filename(filename)
            df_clean['CATEGORIA'] = categoria
            df_clean['ARCHIVO_ORIGEN'] = filename

            print(f"✅ {filename}: {len(df_clean)} productos procesados (categoría: {categoria}) [cols: {codigo_col},{desc_col},{precio_col}]")

            return df_clean

        except Exception as e:
            print(f"❌ Error procesando {filename}: {e}")
            return pd.DataFrame()

    def download_and_parse_pdf(self, file_id: str, filename: str) -> pd.DataFrame:
        """Descargar y parsear PDF de precios. Intenta extraer tablas con pdfplumber."""
        if not PDF_AVAILABLE:
            print(f"⚠️  pdfplumber no disponible, saltando {filename}. Instalá: pip install pdfplumber")
            return pd.DataFrame()

        try:
            request = self.service.files().get_media(fileId=file_id)
            file_io = io.BytesIO()
            downloader = MediaIoBaseDownload(file_io, request)

            done = False
            while done is False:
                status, done = downloader.next_chunk()

            file_io.seek(0)

            productos = []

            with pdfplumber.open(file_io) as pdf:
                for page in pdf.pages:
                    tables = page.extract_tables()
                    if not tables:
                        continue

                    for table in tables:
                        try:
                            df_table = pd.DataFrame(table)
                        except Exception:
                            continue

                        start_row = 0
                        for i in range(min(10, len(df_table))):
                            row_str = " ".join([str(x) for x in df_table.iloc[i].values if pd.notna(x)]).upper()
                            if 'CODIGO' in row_str and ('VENTA' in row_str or 'DESCRIPCION' in row_str):
                                start_row = i + 1
                                break

                        codigo_col, desc_col, precio_col = self.detect_column_structure(df_table, start_row)

                        for i in range(start_row, len(df_table)):
                            row = df_table.iloc[i]
                            if len(row) > max(codigo_col, desc_col, precio_col):
                                codigo = row.iloc[codigo_col] if pd.notna(row.iloc[codigo_col]) else None
                                descripcion = row.iloc[desc_col] if pd.notna(row.iloc[desc_col]) else None
                                precio = row.iloc[precio_col] if pd.notna(row.iloc[precio_col]) else None

                                if (codigo and descripcion and precio and
                                    str(codigo).strip() != '' and
                                    str(descripcion).strip() != '' and
                                    not str(codigo).upper().startswith(('CODIGO',))):
                                    try:
                                        precio_num = float(re.sub(r"[^0-9.,-]", "", str(precio)).replace(',', '.'))
                                        if precio_num > 0:
                                            productos.append({
                                                'CODIGO': str(codigo).strip(),
                                                'DESCRIPCION': str(descripcion).strip(),
                                                'PRECIO_NETO': precio_num
                                            })
                                    except:
                                        continue

            if len(productos) == 0:
                return pd.DataFrame()

            df_clean = pd.DataFrame(productos)
            categoria = self.detect_category_from_filename(filename)
            df_clean['CATEGORIA'] = categoria
            df_clean['ARCHIVO_ORIGEN'] = filename

            print(f"✅ {filename}: {len(df_clean)} productos procesados (PDF, categoría: {categoria})")
            return df_clean

        except Exception as e:
            print(f"❌ Error procesando PDF {filename}: {e}")
            return pd.DataFrame()

    def list_and_process_all_files(self) -> pd.DataFrame:
        """Listar y procesar todos los archivos Excel y PDF del Proveedor 3"""
        if not DRIVE_AVAILABLE:
            print("❌ Google Drive no disponible. Instalá: pip install google-api-python-client google-auth")
            return pd.DataFrame()

        if not self.service:
            if not self.authenticate_drive():
                return pd.DataFrame()

        try:
            # Buscar archivos Excel o PDF en la carpeta
            query = f"'{self.folder_id}' in parents and (name contains '.xlsx' or name contains '.xls' or name contains '.pdf') and trashed=false"
            results = self.service.files().list(q=query, fields="files(id, name, modifiedTime)").execute()
            files = results.get('files', [])

            if not files:
                print("❌ No se encontraron archivos Excel o PDF en la carpeta")
                return pd.DataFrame()

            print(f"\n📄 PROCESANDO {len(files)} ARCHIVOS DEL PROVEEDOR 3 (COBERTORES)")
            print("=" * 60)

            all_products = []

            for file in files:
                fname = file.get('name', '').lower()
                df = pd.DataFrame()

                if '.pdf' in fname:
                    df = self.download_and_parse_pdf(file['id'], file['name'])
                elif '.xls' in fname or '.xlsx' in fname:
                    df = self.download_and_parse_excel(file['id'], file['name'])

                if not df.empty:
                    all_products.append(df)

            if not all_products:
                print("❌ No se pudieron procesar productos de ningún archivo")
                return pd.DataFrame()

            df_unified = pd.concat(all_products, ignore_index=True)

            print(f"\n📊 RESUMEN PROVEEDOR 3 (COBERTORES):")
            print(f"   Total archivos procesados: {len(files)}")
            print(f"   Total productos extraídos: {len(df_unified)}")

            category_counts = df_unified['CATEGORIA'].value_counts()
            print(f"\n🏷️ PRODUCTOS POR CATEGORÍA:")
            for cat, count in category_counts.items():
                cat_display = cat.replace('_', ' ').title()
                print(f"   📦 {cat_display}: {count} productos")

            print(f"\n📋 PRODUCTOS DE EJEMPLO:")
            for _, row in df_unified.head(3).iterrows():
                print(f"   📄 {row['CODIGO']}: {row['DESCRIPCION'][:50]}... (${row['PRECIO_NETO']:,.0f})")

            return df_unified

        except Exception as e:
            print(f"❌ Error general: {e}")
            return pd.DataFrame()

    def calculate_pricing(self, df: pd.DataFrame, strategy_config: Dict) -> pd.DataFrame:
        """Aplicar pricing con parámetros específicos para cobertores"""
        if df.empty:
            return df

        print(f"\n💰 APLICANDO ESTRATEGIA DE PRICING PARA COBERTORES...")
        print(f"🚚 Costo de envío: ${self.shipping_costs['cobertores']:,}")
        print(f"📦 Comisión ML: {self.ml_commissions['cobertores']*100}%")
        print(f"🧾 IVA sobre rentabilidad: {self.iva_sobre_rentabilidad*100}%")

        pricing_results = []

        for _, row in df.iterrows():
            codigo = row['CODIGO']
            descripcion = row['DESCRIPCION']
            precio_neto = row['PRECIO_NETO']
            categoria = row['CATEGORIA']
            archivo = row['ARCHIVO_ORIGEN']

            # Calcular costos base
            precio_real_pagar = precio_neto * self.factor_iva
            costo_envio = self.shipping_costs.get(categoria, self.shipping_costs['default'])
            costo_base_total = precio_real_pagar + costo_envio + self.costo_operativo

            comision_ml = self.ml_commissions.get(categoria, self.ml_commissions['default'])

            # Resolver estrategia display
            if strategy_config['tipo'] == 'porcentaje':
                margen = strategy_config['valor']
                estrategia_display = f"{margen*100:.1f}%"
            elif strategy_config['tipo'] == 'pesos':
                ganancia_fija = strategy_config['valor']
                estrategia_display = f"${ganancia_fija:,.0f}"
            elif strategy_config['tipo'] == 'mixta':
                config_categoria = strategy_config.get('por_categoria', {})
                if categoria in config_categoria:
                    config_cat = config_categoria[categoria]
                    if config_cat['tipo'] == 'porcentaje':
                        margen = config_cat['valor']
                        estrategia_display = f"{margen*100:.1f}%"
                    else:
                        ganancia_fija = config_cat['valor']
                        estrategia_display = f"${ganancia_fija:,.0f}"
                else:
                    margen = 0.15
                    estrategia_display = "15% (default)"

            # Calcular precios para diferentes opciones de cuotas
            precios_cuotas = {}

            for tipo_cuota, costo_cuota in self.cuotas_costs.items():
                if strategy_config['tipo'] == 'mixta' and categoria in strategy_config.get('por_categoria', {}):
                    config_cat = strategy_config['por_categoria'][categoria]
                    if config_cat['tipo'] == 'porcentaje':
                        margen = config_cat['valor']
                        denominador = 1 - margen - comision_ml - costo_cuota - self.costos_financieros_venta - (margen * self.iva_sobre_rentabilidad)
                        if denominador > 0:
                            precio_redondeado = self.round_price(costo_base_total / denominador)
                            precios_cuotas[tipo_cuota] = precio_redondeado
                        else:
                            precios_cuotas[tipo_cuota] = 0
                    else:
                        ganancia_fija = config_cat['valor']
                        iva_sobre_ganancia = ganancia_fija * self.iva_sobre_rentabilidad
                        precio_objetivo = costo_base_total + ganancia_fija + iva_sobre_ganancia
                        denominador = 1 - comision_ml - costo_cuota - self.costos_financieros_venta
                        if denominador > 0:
                            precio_redondeado = self.round_price(precio_objetivo / denominador)
                            precios_cuotas[tipo_cuota] = precio_redondeado
                        else:
                            precios_cuotas[tipo_cuota] = 0
                elif strategy_config['tipo'] == 'porcentaje':
                    margen = strategy_config['valor']
                    denominador = 1 - margen - comision_ml - costo_cuota - self.costos_financieros_venta - (margen * self.iva_sobre_rentabilidad)
                    if denominador > 0:
                        precio_redondeado = self.round_price(costo_base_total / denominador)
                        precios_cuotas[tipo_cuota] = precio_redondeado
                    else:
                        precios_cuotas[tipo_cuota] = 0
                elif strategy_config['tipo'] == 'pesos':
                    ganancia_fija = strategy_config['valor']
                    iva_sobre_ganancia = ganancia_fija * self.iva_sobre_rentabilidad
                    precio_objetivo = costo_base_total + ganancia_fija + iva_sobre_ganancia
                    denominador = 1 - comision_ml - costo_cuota - self.costos_financieros_venta
                    if denominador > 0:
                        precio_redondeado = self.round_price(precio_objetivo / denominador)
                        precios_cuotas[tipo_cuota] = precio_redondeado
                    else:
                        precios_cuotas[tipo_cuota] = 0

            # Calcular ganancia real con precio de 3 cuotas
            precio_3c = precios_cuotas.get('3_cuotas', 0)
            if precio_3c > 0:
                costos_sobre_venta = comision_ml + self.cuotas_costs['3_cuotas'] + self.costos_financieros_venta
                ingresos_netos = precio_3c * (1 - costos_sobre_venta)
                ganancia_bruta = ingresos_netos - costo_base_total
                iva_sobre_ganancia = ganancia_bruta * self.iva_sobre_rentabilidad
                ganancia_real = ganancia_bruta - iva_sobre_ganancia
                margen_real = ganancia_real / precio_3c if precio_3c > 0 else 0
            else:
                ganancia_real = 0
                margen_real = 0

            pricing_results.append({
                'Código': codigo,
                'Producto': descripcion[:50] + '...' if len(descripcion) > 50 else descripcion,
                'Categoría': categoria.replace('_', ' ').title(),
                'Archivo': archivo,
                'PrecioNeto': int(precio_neto),
                'CostoBase': int(costo_base_total),
                'ML_3_Cuotas': int(precios_cuotas.get('3_cuotas', 0)),
                'ML_6_Cuotas': int(precios_cuotas.get('6_cuotas', 0)),
                'ML_12_Cuotas': int(precios_cuotas.get('12_cuotas', 0)),
                'ML_CuotasBajas': int(precios_cuotas.get('cuotas_bajas', 0)),
                'ML_SinCuotas': int(precios_cuotas.get('sin_cuotas', 0)),
                'GananciaReal': int(ganancia_real),
                'MargenReal%': f"{margen_real*100:.1f}%",
                'Estrategia': estrategia_display,
                'ComisionML%': f"{comision_ml*100:.1f}%",
                'CostoEnvio': int(costo_envio)
            })

        df_pricing = pd.DataFrame(pricing_results)
        df_viable = df_pricing[df_pricing['ML_3_Cuotas'] > 0]
        print(f"✅ Pricing aplicado: {len(df_viable)}/{len(df_pricing)} productos viables")

        return df_pricing

    def round_price(self, precio: float) -> int:
        """Redondear a precios atractivos"""
        if precio < 20000:
            return int(round(precio / 500) * 500 - 10)
        elif precio < 100000:
            return int(round(precio / 1000) * 1000 - 100)
        else:
            return int(round(precio / 5000) * 5000 - 1000)

    def export_results(self, df: pd.DataFrame) -> str:
        """Exportar resultados finales a Excel"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        filename = f"Proveedor3_Cobertores_Pricing_{timestamp}.xlsx"

        try:
            with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Todos_Productos', index=False)

                for categoria in df['Categoría'].unique():
                    if categoria and categoria != 'Default':
                        df_cat = df[df['Categoría'] == categoria]
                        if not df_cat.empty:
                            sheet_name = categoria.replace(' ', '_')[:31]
                            df_cat.to_excel(writer, sheet_name=sheet_name, index=False)

                resumen_data = []
                for categoria in df['Categoría'].unique():
                    if categoria:
                        df_cat = df[df['Categoría'] == categoria]
                        df_viable = df_cat[df_cat['ML_3_Cuotas'] > 0]

                        resumen_data.append({
                            'Categoría': categoria,
                            'Total_Productos': len(df_cat),
                            'Productos_Viables': len(df_viable),
                            'Precio_Promedio': df_viable['ML_3_Cuotas'].mean() if len(df_viable) > 0 else 0,
                            'Ganancia_Promedio': df_viable['GananciaReal'].mean() if len(df_viable) > 0 else 0,
                            'Margen_Promedio%': df_viable['MargenReal%'].str.replace('%', '').astype(float).mean() if len(df_viable) > 0 else 0
                        })

                df_resumen = pd.DataFrame(resumen_data)
                df_resumen.to_excel(writer, sheet_name='Resumen', index=False)

            print(f"✅ Archivo exportado: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Error exportando: {e}")
            return None


def main():
    """Función principal del sistema Proveedor 3"""
    print("🏠 SISTEMA COMPLETO PROVEEDOR 3 - COBERTORES")
    print("=" * 50)
    print("Google Drive + Pricing Automatizado")
    print("✨ INCLUYE: IVA sobre rentabilidad (21%)")
    print("🎯 CATEGORÍA ESPECIALIZADA: Cobertores")
    print("🚚 COSTO ENVÍO: $40,000")
    print("🎯 SUGERENCIAS: Automáticas basadas en 12% ganancia final\n")

    system = Proveedor3PricingSystem()

    if not DRIVE_AVAILABLE:
        print("❌ Google Drive no disponible")
        print("🔧 Para instalar: pip install google-api-python-client google-auth")
        return

    print(f"✅ Configuración cargada")
    print(f"📁 Folder ID: {system.folder_id}")
    print(f"🚚 Costo envío cobertores: ${system.shipping_costs['cobertores']:,}")
    print(f"📦 Comisión ML: {system.ml_commissions['cobertores']*100}%")
    print(f"💰 IVA sobre rentabilidad: {system.iva_sobre_rentabilidad*100}%")

    print(f"\n🔄 Conectando con Google Drive...")
    if not system.authenticate_drive():
        print("❌ Error de autenticación")
        print("🔧 Verificá que tengas el archivo service_account_credentials.json")
        return

    print(f"✅ Conectado exitosamente")

    df_products = system.list_and_process_all_files()

    if df_products.empty:
        print("❌ No se pudieron procesar productos")
        return

    print(f"\n💰 CONFIGURACIÓN DE PRICING PARA COBERTORES:")
    print("1️⃣ PORCENTAJE FIJO - Un margen % para todos los cobertores")
    print("2️⃣ GANANCIA FIJA - Una ganancia $ fija para todos los cobertores")
    print("3️⃣ VER SUGERENCIAS - Basadas en 12% ganancia final")
    print("4️⃣ COMPARACIÓN - Diferentes opciones lado a lado")

    while True:
        try:
            strategy_choice = input("\nElegí estrategia (1-4): ").strip()
            if strategy_choice in ['1', '2', '3', '4']:
                break
            print("❌ Opción inválida")
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta luego!")
            return

    if strategy_choice == '1':
        while True:
            try:
                margen = float(input("\n📈 Margen para cobertores (ej: 15 para 15%): "))
                if 0 < margen <= 100:
                    strategy_config = {'tipo': 'porcentaje', 'valor': margen / 100}
                    print(f"\n🔄 Procesando con {margen}% margen...")
                    break
                else:
                    print("❌ Margen debe estar entre 0% y 100%")
            except ValueError:
                print("❌ Ingresá un número válido")

    elif strategy_choice == '2':
        while True:
            try:
                ganancia_input = input("\n💰 Ganancia fija para cobertores (ej: 50000): $").strip()
                ganancia = float(ganancia_input.replace(',', ''))
                if ganancia > 0:
                    strategy_config = {'tipo': 'pesos', 'valor': ganancia}
                    print(f"\n🔄 Procesando con ${ganancia:,.0f} ganancia fija...")
                    break
                else:
                    print("❌ La ganancia debe ser mayor a 0")
            except ValueError:
                print("❌ Ingresá un número válido")

    elif strategy_choice == '3':
        print("\n🎯 CALCULANDO SUGERENCIAS AUTOMÁTICAS...")
        sugerencias = system.calculate_smart_suggestions(df_products)

        if 'cobertores' in sugerencias:
            sugerido = sugerencias['cobertores']
            print(f"\n💡 SUGERENCIA PARA COBERTORES:")
            print(f"   Ganancia óptima: ${sugerido:,.0f}")
            print(f"   (Basada en 12% ganancia final después de todos los costos)")

            usar_sugerencia = input(f"\n¿Usar esta sugerencia? (s/n): ").strip().lower()
            if usar_sugerencia in ['s', 'si', 'yes', 'y']:
                strategy_config = {'tipo': 'pesos', 'valor': sugerido}
                print(f"✅ Usando ganancia sugerida: ${sugerido:,.0f}")
            else:
                return main()
        else:
            print("❌ No se pudo calcular sugerencia")
            return main()

    elif strategy_choice == '4':
        print("\n📊 COMPARACIÓN DE ESTRATEGIAS PARA COBERTORES:")
        print("=" * 60)

        sugerencias_auto = system.calculate_smart_suggestions(df_products)
        sugerido = sugerencias_auto.get('cobertores', 50000)

        estrategias = [
            {'nombre': '10% Margen', 'config': {'tipo': 'porcentaje', 'valor': 0.10}},
            {'nombre': '15% Margen', 'config': {'tipo': 'porcentaje', 'valor': 0.15}},
            {'nombre': '20% Margen', 'config': {'tipo': 'porcentaje', 'valor': 0.20}},
            {'nombre': f'Auto ${sugerido:,.0f} (12% ganancia)', 'config': {'tipo': 'pesos', 'valor': sugerido}}
        ]

        for i, estrategia in enumerate(estrategias, 1):
            print(f"\n🎯 {i}. {estrategia['nombre']}:")
            df_preview = system.calculate_pricing(df_products.head(5), estrategia['config'])
            if not df_preview.empty:
                for _, row in df_preview.iterrows():
                    print(f"   {row['Código']}: ${row['ML_3_Cuotas']:,} (ganancia: ${row['GananciaReal']:,})")

        print(f"\n🔢 ¿Cuál querés usar?")
        for i, estrategia in enumerate(estrategias, 1):
            print(f"   {i}. {estrategia['nombre']}")
        print(f"   {len(estrategias)+1}. Configurar manualmente")

        while True:
            try:
                cual = int(input("\nElegí opción: "))
                if 1 <= cual <= len(estrategias):
                    strategy_config = estrategias[cual-1]['config']
                    break
                elif cual == len(estrategias)+1:
                    return main()
                else:
                    print("❌ Opción inválida")
            except ValueError:
                print("❌ Ingresá un número válido")

    print(f"\n🔄 Procesando precios para {len(df_products)} cobertores...")
    df_final = system.calculate_pricing(df_products, strategy_config)

    if df_final.empty:
        print("❌ No se pudieron calcular precios")
        return

    print(f"\n📊 RESUMEN FINAL - COBERTORES:")
    print("-" * 50)
    viable_products = df_final[df_final['ML_3_Cuotas'] > 0]
    print(f"✅ Productos viables: {len(viable_products)}/{len(df_final)}")
    print(f"💰 Precio promedio: ${viable_products['ML_3_Cuotas'].mean():,.0f}")
    print(f"📈 Ganancia promedio: ${viable_products['GananciaReal'].mean():,.0f}")
    print(f"🚚 Costo envío: ${system.shipping_costs['cobertores']:,}")
    print(f"🧾 Incluye IVA sobre rentabilidad (21%)")

    print(f"\n🔍 PREVIEW (primeros 10 productos):")
    preview_columns = ['Código', 'Producto', 'ML_3_Cuotas', 'ML_SinCuotas', 'GananciaReal', 'MargenReal%']
    print(viable_products[preview_columns].head(10).to_string(index=False))

    export = input(f"\n💾 ¿Exportar todos los resultados a Excel? (s/n): ").strip().lower()
    if export in ['s', 'si', 'yes', 'y']:
        filename = system.export_results(df_final)
        if filename:
            print(f"\n🎉 ¡SISTEMA COMPLETADO!")
            print(f"📁 Archivo: {filename}")
            print(f"📊 {len(df_final)} productos procesados")
            print(f"💰 {len(viable_products)} productos viables")
            print(f"🏠 Especializado en cobertores")
            print(f"🚚 Costo envío: ${system.shipping_costs['cobertores']:,}")
            print(f"🧾 IVA sobre rentabilidad incluido")
            print(f"🚀 Listo para subir a MercadoLibre")

    print(f"\n✅ Proceso finalizado exitosamente")


if __name__ == "__main__":
    main()

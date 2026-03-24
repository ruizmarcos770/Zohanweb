-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" TEXT NOT NULL,
    "especialidad" TEXT,
    "licencia" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "sexo" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "provincia" TEXT,
    "contactoEmergNombre" TEXT,
    "contactoEmergTel" TEXT,
    "contactoEmergRelacion" TEXT,
    "tipoTratamiento" TEXT NOT NULL,
    "tipoAdiccion" TEXT NOT NULL,
    "sustanciasPrincipales" TEXT,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEgreso" DATETIME,
    "motivoEgreso" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "grupoSanguineo" TEXT,
    "alergias" TEXT,
    "antecedentesMedicos" TEXT,
    "medicacionPrevia" TEXT,
    "obraSocial" TEXT,
    "nroAfiliado" TEXT,
    "habitacionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Paciente_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "nombre" TEXT,
    "tipo" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "piso" INTEGER NOT NULL DEFAULT 1,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "subtipo" TEXT,
    "fecha" DATETIME NOT NULL,
    "duracion" INTEGER NOT NULL DEFAULT 60,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "notas" TEXT,
    "pacienteId" TEXT,
    "sesionGrupoId" TEXT,
    "staffId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sesion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sesion_sesionGrupoId_fkey" FOREIGN KEY ("sesionGrupoId") REFERENCES "SesionGrupo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sesion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SesionGrupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SesionGrupoParticipante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sesionGrupoId" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SesionGrupoParticipante_sesionGrupoId_fkey" FOREIGN KEY ("sesionGrupoId") REFERENCES "SesionGrupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SesionGrupoParticipante_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotaEvolucion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "staffId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotaEvolucion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaEvolucion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "principioActivo" TEXT,
    "presentacion" TEXT,
    "concentracion" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 10,
    "unidad" TEXT NOT NULL DEFAULT 'unidades',
    "precioUnitario" REAL,
    "laboratorio" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prescripcion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "staffId" TEXT,
    "dosis" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "via" TEXT NOT NULL DEFAULT 'ORAL',
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "indicaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescripcion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescripcion_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescripcion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdministracionMedicamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prescripcionId" TEXT NOT NULL,
    "staffId" TEXT,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosis" TEXT NOT NULL,
    "administrado" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdministracionMedicamento_prescripcionId_fkey" FOREIGN KEY ("prescripcionId") REFERENCES "Prescripcion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdministracionMedicamento_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicamentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoStock_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CuentaPaciente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pacienteId" TEXT NOT NULL,
    "saldo" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuentaPaciente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concepto" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "metodo" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "pacienteId" TEXT,
    "cuentaPacienteId" TEXT,
    "staffId" TEXT,
    "comprobante" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ingreso_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ingreso_cuentaPacienteId_fkey" FOREIGN KEY ("cuentaPacienteId") REFERENCES "CuentaPaciente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ingreso_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concepto" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "proveedor" TEXT,
    "factura" TEXT,
    "metodo" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    "staffId" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Gasto_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PresupuestoMensual" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "Paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Habitacion_numero_key" ON "Habitacion"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "SesionGrupoParticipante_sesionGrupoId_pacienteId_key" ON "SesionGrupoParticipante"("sesionGrupoId", "pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "CuentaPaciente_pacienteId_key" ON "CuentaPaciente"("pacienteId");

-- CreateIndex
CREATE UNIQUE INDEX "PresupuestoMensual_anio_mes_categoria_key" ON "PresupuestoMensual"("anio", "mes", "categoria");

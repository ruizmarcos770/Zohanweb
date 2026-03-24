import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Staff
  const staff = await Promise.all([
    prisma.staff.upsert({
      where: { email: 'garcia@clinica.com' },
      update: {},
      create: {
        nombre: 'Carlos',
        apellido: 'García',
        email: 'garcia@clinica.com',
        telefono: '011-4555-1234',
        rol: 'MEDICO',
        especialidad: 'Psiquiatría',
        licencia: 'MP-12345',
      },
    }),
    prisma.staff.upsert({
      where: { email: 'rodriguez@clinica.com' },
      update: {},
      create: {
        nombre: 'Ana',
        apellido: 'Rodríguez',
        email: 'rodriguez@clinica.com',
        telefono: '011-4555-5678',
        rol: 'PSICOLOGO',
        especialidad: 'Psicología Clínica',
        licencia: 'MP-67890',
      },
    }),
    prisma.staff.upsert({
      where: { email: 'martinez@clinica.com' },
      update: {},
      create: {
        nombre: 'Laura',
        apellido: 'Martínez',
        email: 'martinez@clinica.com',
        telefono: '011-4555-9012',
        rol: 'ENFERMERO',
        especialidad: 'Enfermería',
      },
    }),
    prisma.staff.upsert({
      where: { email: 'lopez@clinica.com' },
      update: {},
      create: {
        nombre: 'Miguel',
        apellido: 'López',
        email: 'lopez@clinica.com',
        telefono: '011-4555-3456',
        rol: 'TERAPEUTA',
        especialidad: 'Terapia Ocupacional',
      },
    }),
    prisma.staff.upsert({
      where: { email: 'admin@clinica.com' },
      update: {},
      create: {
        nombre: 'Sofía',
        apellido: 'Torres',
        email: 'admin@clinica.com',
        telefono: '011-4555-7890',
        rol: 'ADMIN',
      },
    }),
  ])

  console.log('Staff created:', staff.length)

  // Habitaciones
  const habitaciones = await Promise.all([
    prisma.habitacion.upsert({ where: { numero: '101' }, update: {}, create: { numero: '101', nombre: 'Habitación 101', tipo: 'INDIVIDUAL', capacidad: 1, piso: 1 } }),
    prisma.habitacion.upsert({ where: { numero: '102' }, update: {}, create: { numero: '102', nombre: 'Habitación 102', tipo: 'INDIVIDUAL', capacidad: 1, piso: 1 } }),
    prisma.habitacion.upsert({ where: { numero: '103' }, update: {}, create: { numero: '103', nombre: 'Habitación 103', tipo: 'DOBLE', capacidad: 2, piso: 1 } }),
    prisma.habitacion.upsert({ where: { numero: '201' }, update: {}, create: { numero: '201', nombre: 'Habitación 201', tipo: 'INDIVIDUAL', capacidad: 1, piso: 2 } }),
    prisma.habitacion.upsert({ where: { numero: '202' }, update: {}, create: { numero: '202', nombre: 'Habitación 202', tipo: 'DOBLE', capacidad: 2, piso: 2 } }),
    prisma.habitacion.upsert({ where: { numero: '203' }, update: {}, create: { numero: '203', nombre: 'Habitación 203', tipo: 'MULTIPLE', capacidad: 4, piso: 2 } }),
  ])

  console.log('Habitaciones created:', habitaciones.length)

  // Medicamentos
  const medicamentos = await Promise.all([
    prisma.medicamento.upsert({ where: { id: 'med-001' }, update: {}, create: { id: 'med-001', nombre: 'Diazepam', principioActivo: 'Diazepam', presentacion: 'COMPRIMIDO', concentracion: '10mg', stock: 200, stockMinimo: 50, precioUnitario: 15.5, laboratorio: 'Roche' } }),
    prisma.medicamento.upsert({ where: { id: 'med-002' }, update: {}, create: { id: 'med-002', nombre: 'Naltrexona', principioActivo: 'Naltrexona', presentacion: 'COMPRIMIDO', concentracion: '50mg', stock: 100, stockMinimo: 30, precioUnitario: 85.0, laboratorio: 'Biolatam' } }),
    prisma.medicamento.upsert({ where: { id: 'med-003' }, update: {}, create: { id: 'med-003', nombre: 'Acamprosato', principioActivo: 'Acamprosato Cálcico', presentacion: 'COMPRIMIDO', concentracion: '333mg', stock: 150, stockMinimo: 40, precioUnitario: 62.0, laboratorio: 'Merck' } }),
    prisma.medicamento.upsert({ where: { id: 'med-004' }, update: {}, create: { id: 'med-004', nombre: 'Buprenorfina', principioActivo: 'Buprenorfina', presentacion: 'SUBLINGUAL', concentracion: '8mg', stock: 80, stockMinimo: 20, precioUnitario: 320.0, laboratorio: 'Indivior' } }),
    prisma.medicamento.upsert({ where: { id: 'med-005' }, update: {}, create: { id: 'med-005', nombre: 'Olanzapina', principioActivo: 'Olanzapina', presentacion: 'COMPRIMIDO', concentracion: '10mg', stock: 120, stockMinimo: 30, precioUnitario: 45.0, laboratorio: 'Lilly' } }),
    prisma.medicamento.upsert({ where: { id: 'med-006' }, update: {}, create: { id: 'med-006', nombre: 'Lorazepam', principioActivo: 'Lorazepam', presentacion: 'COMPRIMIDO', concentracion: '2mg', stock: 180, stockMinimo: 50, precioUnitario: 22.0, laboratorio: 'Wyeth' } }),
    prisma.medicamento.upsert({ where: { id: 'med-007' }, update: {}, create: { id: 'med-007', nombre: 'Tiamina', principioActivo: 'Vitamina B1', presentacion: 'INYECTABLE', concentracion: '100mg/ml', stock: 60, stockMinimo: 20, precioUnitario: 18.0, laboratorio: 'Biomedic' } }),
  ])

  console.log('Medicamentos created:', medicamentos.length)

  // Pacientes
  const pacientes = await Promise.all([
    prisma.paciente.upsert({
      where: { dni: '28456789' },
      update: {},
      create: {
        nombre: 'Roberto',
        apellido: 'Fernández',
        dni: '28456789',
        fechaNacimiento: new Date('1985-03-15'),
        sexo: 'MASCULINO',
        telefono: '011-6543-2109',
        email: 'roberto.f@email.com',
        direccion: 'Av. Corrientes 1234',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        contactoEmergNombre: 'María Fernández',
        contactoEmergTel: '011-6543-9876',
        contactoEmergRelacion: 'Esposa',
        tipoTratamiento: 'RESIDENCIAL',
        tipoAdiccion: 'ALCOHOL',
        sustanciasPrincipales: 'Alcohol',
        fechaIngreso: new Date('2026-01-10'),
        grupoSanguineo: 'A+',
        alergias: 'Ninguna conocida',
        antecedentesMedicos: 'Hipertensión arterial controlada',
        obraSocial: 'OSDE',
        nroAfiliado: '123456789',
        habitacionId: habitaciones[0].id,
      },
    }),
    prisma.paciente.upsert({
      where: { dni: '32178456' },
      update: {},
      create: {
        nombre: 'Valentina',
        apellido: 'Morales',
        dni: '32178456',
        fechaNacimiento: new Date('1993-07-22'),
        sexo: 'FEMENINO',
        telefono: '011-5432-1098',
        email: 'valentina.m@email.com',
        direccion: 'Calle Florida 567',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        contactoEmergNombre: 'Jorge Morales',
        contactoEmergTel: '011-5432-8765',
        contactoEmergRelacion: 'Padre',
        tipoTratamiento: 'RESIDENCIAL',
        tipoAdiccion: 'DROGAS',
        sustanciasPrincipales: 'Cocaína, Alcohol',
        fechaIngreso: new Date('2026-02-05'),
        grupoSanguineo: 'O+',
        alergias: 'Penicilina',
        antecedentesMedicos: 'Depresión',
        obraSocial: 'Swiss Medical',
        nroAfiliado: '987654321',
        habitacionId: habitaciones[1].id,
      },
    }),
    prisma.paciente.upsert({
      where: { dni: '25678901' },
      update: {},
      create: {
        nombre: 'Diego',
        apellido: 'Sánchez',
        dni: '25678901',
        fechaNacimiento: new Date('1978-11-08'),
        sexo: 'MASCULINO',
        telefono: '011-4321-0987',
        email: 'diego.s@email.com',
        direccion: 'Belgrano 890',
        ciudad: 'Córdoba',
        provincia: 'Córdoba',
        contactoEmergNombre: 'Carmen Sánchez',
        contactoEmergTel: '011-4321-6543',
        contactoEmergRelacion: 'Hermana',
        tipoTratamiento: 'RESIDENCIAL',
        tipoAdiccion: 'MULTIPLE',
        sustanciasPrincipales: 'Alcohol, Marihuana, Benzodiazepinas',
        fechaIngreso: new Date('2025-12-01'),
        grupoSanguineo: 'B+',
        alergias: 'Ibuprofeno',
        antecedentesMedicos: 'Hepatitis C, Ansiedad generalizada',
        obraSocial: 'Galeno',
        nroAfiliado: '456789012',
        habitacionId: habitaciones[2].id,
      },
    }),
    prisma.paciente.upsert({
      where: { dni: '38901234' },
      update: {},
      create: {
        nombre: 'Luciana',
        apellido: 'Pérez',
        dni: '38901234',
        fechaNacimiento: new Date('1998-04-30'),
        sexo: 'FEMENINO',
        telefono: '011-3210-9876',
        email: 'luciana.p@email.com',
        direccion: 'San Martín 234',
        ciudad: 'Rosario',
        provincia: 'Santa Fe',
        contactoEmergNombre: 'Marta Pérez',
        contactoEmergTel: '011-3210-5432',
        contactoEmergRelacion: 'Madre',
        tipoTratamiento: 'AMBULATORIO',
        tipoAdiccion: 'DROGAS',
        sustanciasPrincipales: 'Marihuana, Éxtasis',
        fechaIngreso: new Date('2026-01-20'),
        grupoSanguineo: 'AB+',
        alergias: 'Ninguna',
        antecedentesMedicos: 'Trastorno bipolar',
        obraSocial: 'PAMI',
        nroAfiliado: '234567890',
      },
    }),
    prisma.paciente.upsert({
      where: { dni: '30567890' },
      update: {},
      create: {
        nombre: 'Martín',
        apellido: 'González',
        dni: '30567890',
        fechaNacimiento: new Date('1989-09-14'),
        sexo: 'MASCULINO',
        telefono: '011-2109-8765',
        email: 'martin.g@email.com',
        direccion: 'Rivadavia 3456',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        contactoEmergNombre: 'Elena González',
        contactoEmergTel: '011-2109-4321',
        contactoEmergRelacion: 'Madre',
        tipoTratamiento: 'AMBULATORIO',
        tipoAdiccion: 'ALCOHOL',
        sustanciasPrincipales: 'Alcohol',
        fechaIngreso: new Date('2026-02-15'),
        grupoSanguineo: 'O-',
        alergias: 'Aspirina',
        antecedentesMedicos: 'Diabetes tipo 2',
      },
    }),
  ])

  console.log('Pacientes created:', pacientes.length)

  // Cuentas de pacientes
  for (const p of pacientes) {
    await prisma.cuentaPaciente.upsert({
      where: { pacienteId: p.id },
      update: {},
      create: { pacienteId: p.id, saldo: 0 },
    })
  }

  // Sesiones de terapia
  const hoy = new Date()
  const sesiones = await Promise.all([
    prisma.sesion.create({
      data: {
        tipo: 'INDIVIDUAL',
        subtipo: 'PSICOLOGICA',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 10, 0),
        duracion: 60,
        estado: 'PROGRAMADA',
        pacienteId: pacientes[0].id,
        staffId: staff[1].id,
      },
    }),
    prisma.sesion.create({
      data: {
        tipo: 'INDIVIDUAL',
        subtipo: 'PSIQUIATRICA',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 11, 0),
        duracion: 45,
        estado: 'PROGRAMADA',
        pacienteId: pacientes[1].id,
        staffId: staff[0].id,
      },
    }),
    prisma.sesion.create({
      data: {
        tipo: 'INDIVIDUAL',
        subtipo: 'PSICOLOGICA',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1, 14, 0),
        duracion: 60,
        estado: 'COMPLETADA',
        pacienteId: pacientes[2].id,
        staffId: staff[1].id,
        notas: 'Paciente muestra progreso en el control de impulsos. Trabajamos técnicas de respiración.',
      },
    }),
    prisma.sesion.create({
      data: {
        tipo: 'INDIVIDUAL',
        subtipo: 'FAMILIAR',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 2, 16, 0),
        duracion: 90,
        estado: 'PROGRAMADA',
        pacienteId: pacientes[0].id,
        staffId: staff[1].id,
      },
    }),
  ])

  // Grupo terapéutico
  const grupoTerapeutico = await prisma.sesionGrupo.create({
    data: {
      nombre: 'Grupo Terapéutico - Lunes/Miércoles/Viernes',
      tipo: 'TERAPEUTICA',
      descripcion: 'Sesión grupal de terapia para pacientes residenciales',
      participantes: {
        create: [
          { pacienteId: pacientes[0].id },
          { pacienteId: pacientes[1].id },
          { pacienteId: pacientes[2].id },
        ],
      },
    },
  })

  await prisma.sesion.create({
    data: {
      tipo: 'GRUPAL',
      subtipo: 'GRUPAL_TERAPEUTICA',
      fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 15, 0),
      duracion: 90,
      estado: 'PROGRAMADA',
      sesionGrupoId: grupoTerapeutico.id,
      staffId: staff[3].id,
    },
  })

  console.log('Sesiones created:', sesiones.length)

  // Prescripciones
  await Promise.all([
    prisma.prescripcion.create({
      data: {
        pacienteId: pacientes[0].id,
        medicamentoId: medicamentos[2].id, // Acamprosato
        staffId: staff[0].id,
        dosis: '2 comprimidos',
        frecuencia: 'CADA_8HS',
        via: 'ORAL',
        fechaInicio: new Date('2026-01-10'),
        indicaciones: 'Tomar con las comidas principales',
      },
    }),
    prisma.prescripcion.create({
      data: {
        pacienteId: pacientes[0].id,
        medicamentoId: medicamentos[1].id, // Naltrexona
        staffId: staff[0].id,
        dosis: '1 comprimido',
        frecuencia: 'CADA_24HS',
        via: 'ORAL',
        fechaInicio: new Date('2026-01-10'),
        indicaciones: 'Tomar por la mañana',
      },
    }),
    prisma.prescripcion.create({
      data: {
        pacienteId: pacientes[1].id,
        medicamentoId: medicamentos[4].id, // Olanzapina
        staffId: staff[0].id,
        dosis: '1 comprimido',
        frecuencia: 'CADA_24HS',
        via: 'ORAL',
        fechaInicio: new Date('2026-02-05'),
        indicaciones: 'Tomar por la noche',
      },
    }),
    prisma.prescripcion.create({
      data: {
        pacienteId: pacientes[2].id,
        medicamentoId: medicamentos[0].id, // Diazepam
        staffId: staff[0].id,
        dosis: '1 comprimido',
        frecuencia: 'CADA_12HS',
        via: 'ORAL',
        fechaInicio: new Date('2025-12-01'),
        fechaFin: new Date('2026-02-01'),
        activa: false,
        indicaciones: 'Solo durante fase de desintoxicación',
      },
    }),
  ])

  // Notas de evolución
  await Promise.all([
    prisma.notaEvolucion.create({
      data: {
        pacienteId: pacientes[0].id,
        staffId: staff[0].id,
        tipo: 'MEDICA',
        contenido: 'Paciente en buen estado general. Tensión arterial 120/80. Refiere buen descanso nocturno. Se ajusta dosis de Acamprosato.',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 3),
      },
    }),
    prisma.notaEvolucion.create({
      data: {
        pacienteId: pacientes[0].id,
        staffId: staff[1].id,
        tipo: 'PSICOLOGICA',
        contenido: 'El paciente demuestra mayor apertura en las sesiones. Trabaja activamente en identificar disparadores del consumo. Se sugiere incorporar a grupo familiar.',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1),
      },
    }),
    prisma.notaEvolucion.create({
      data: {
        pacienteId: pacientes[1].id,
        staffId: staff[2].id,
        tipo: 'ENFERMERIA',
        contenido: 'Administración de medicación según prescripción. Sin eventos adversos. Paciente descansó bien.',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()),
      },
    }),
  ])

  // Finanzas - Ingresos
  const cuentas = await prisma.cuentaPaciente.findMany()
  await Promise.all([
    prisma.ingreso.create({
      data: {
        fecha: new Date('2026-01-10'),
        concepto: 'Ingreso inicial - Roberto Fernández',
        monto: 150000,
        tipo: 'CUOTA_MENSUAL',
        metodo: 'TRANSFERENCIA',
        pacienteId: pacientes[0].id,
        cuentaPacienteId: cuentas.find(c => c.pacienteId === pacientes[0].id)?.id,
        staffId: staff[4].id,
        comprobante: 'REC-2026-001',
      },
    }),
    prisma.ingreso.create({
      data: {
        fecha: new Date('2026-02-05'),
        concepto: 'Ingreso inicial - Valentina Morales',
        monto: 180000,
        tipo: 'CUOTA_MENSUAL',
        metodo: 'TRANSFERENCIA',
        pacienteId: pacientes[1].id,
        cuentaPacienteId: cuentas.find(c => c.pacienteId === pacientes[1].id)?.id,
        staffId: staff[4].id,
        comprobante: 'REC-2026-002',
      },
    }),
    prisma.ingreso.create({
      data: {
        fecha: new Date('2026-02-01'),
        concepto: 'Pago cuota mensual - Diego Sánchez',
        monto: 160000,
        tipo: 'CUOTA_MENSUAL',
        metodo: 'EFECTIVO',
        pacienteId: pacientes[2].id,
        cuentaPacienteId: cuentas.find(c => c.pacienteId === pacientes[2].id)?.id,
        staffId: staff[4].id,
        comprobante: 'REC-2026-003',
      },
    }),
    prisma.ingreso.create({
      data: {
        fecha: new Date('2026-02-10'),
        concepto: 'Cobertura OSDE - Roberto Fernández',
        monto: 50000,
        tipo: 'OBRA_SOCIAL',
        metodo: 'TRANSFERENCIA',
        pacienteId: pacientes[0].id,
        staffId: staff[4].id,
        comprobante: 'OS-2026-001',
      },
    }),
    prisma.ingreso.create({
      data: {
        fecha: new Date('2026-03-01'),
        concepto: 'Cuota mensual marzo - Roberto Fernández',
        monto: 150000,
        tipo: 'CUOTA_MENSUAL',
        metodo: 'TRANSFERENCIA',
        pacienteId: pacientes[0].id,
        cuentaPacienteId: cuentas.find(c => c.pacienteId === pacientes[0].id)?.id,
        staffId: staff[4].id,
        comprobante: 'REC-2026-010',
      },
    }),
  ])

  // Gastos
  await Promise.all([
    prisma.gasto.create({ data: { fecha: new Date('2026-03-01'), concepto: 'Sueldos personal - Marzo', monto: 320000, categoria: 'PERSONAL', metodo: 'TRANSFERENCIA', staffId: staff[4].id, factura: 'FAC-2026-031' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-05'), concepto: 'Compra medicamentos', monto: 45000, categoria: 'MEDICAMENTOS', proveedor: 'Farmacia Central', metodo: 'TRANSFERENCIA', staffId: staff[4].id, factura: 'FAC-FARM-001' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-07'), concepto: 'Alimentos y provisiones', monto: 28000, categoria: 'ALIMENTACION', proveedor: 'Distribuidora Norte', metodo: 'EFECTIVO', staffId: staff[4].id } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-10'), concepto: 'Servicio de electricidad', monto: 18000, categoria: 'SERVICIOS', proveedor: 'EDENOR', metodo: 'DEBITO_AUTOMATICO', factura: 'FAC-EDEN-Mar26' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-10'), concepto: 'Servicio de gas', monto: 12000, categoria: 'SERVICIOS', proveedor: 'Metrogas', metodo: 'DEBITO_AUTOMATICO' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-12'), concepto: 'Insumos médicos descartables', monto: 8500, categoria: 'INSUMOS', proveedor: 'Medisur', metodo: 'TRANSFERENCIA' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-02-01'), concepto: 'Sueldos personal - Febrero', monto: 320000, categoria: 'PERSONAL', metodo: 'TRANSFERENCIA', staffId: staff[4].id } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-02-05'), concepto: 'Alimentos y provisiones', monto: 25000, categoria: 'ALIMENTACION', proveedor: 'Distribuidora Norte', metodo: 'EFECTIVO' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-01-01'), concepto: 'Alquiler mensual - Enero', monto: 180000, categoria: 'ALQUILER', proveedor: 'Inmobiliaria Central', metodo: 'TRANSFERENCIA' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-02-01'), concepto: 'Alquiler mensual - Febrero', monto: 180000, categoria: 'ALQUILER', proveedor: 'Inmobiliaria Central', metodo: 'TRANSFERENCIA' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-01'), concepto: 'Alquiler mensual - Marzo', monto: 180000, categoria: 'ALQUILER', proveedor: 'Inmobiliaria Central', metodo: 'TRANSFERENCIA' } }),
    prisma.gasto.create({ data: { fecha: new Date('2026-03-15'), concepto: 'Mantenimiento instalaciones', monto: 15000, categoria: 'MANTENIMIENTO', proveedor: 'Servicios Integrales SA', metodo: 'EFECTIVO' } }),
  ])

  console.log('Finanzas created')
  console.log('Seed completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

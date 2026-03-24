import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const data = await request.json()
  const nota = await prisma.notaEvolucion.create({
    data: {
      pacienteId: data.pacienteId,
      tipo: data.tipo,
      contenido: data.contenido,
      fecha: new Date(),
    },
  })
  return Response.json(nota)
}

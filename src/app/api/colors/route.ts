import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { SimpleColor } from '@/types/newTypes'

const createColorSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim()
})

// GET /api/colors - Obtener todos los colores
export async function GET() {
  try {
    const colors = await prisma.colors.findMany({
      orderBy: { name: 'asc' }
    })

    const serializedColors: SimpleColor[] = colors.map(color => ({
      id: color.id,
      name: color.name,
      createdAt: color.createdAt.toISOString(),
      updatedAt: color.updatedAt.toISOString()
    }))

    return NextResponse.json(serializedColors)
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/colors - Crear nuevo color
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createColorSchema.parse(body)

    // Verificar que no exista un color con el mismo nombre
    const existingColor = await prisma.colors.findFirst({
      where: {
        name: validatedData.name
      }
    })

    if (existingColor) {
      return NextResponse.json(
        { error: 'Ya existe un color con ese nombre' },
        { status: 409 }
      )
    }

    const color = await prisma.colors.create({
      data: {
        name: validatedData.name,
        companyId: 1 // TODO: Obtener de la sesión del usuario
      }
    })

    const serializedColor: SimpleColor = {
      id: color.id,
      name: color.name,
      createdAt: color.createdAt.toISOString(),
      updatedAt: color.updatedAt.toISOString()
    }

    return NextResponse.json(serializedColor, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating color:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
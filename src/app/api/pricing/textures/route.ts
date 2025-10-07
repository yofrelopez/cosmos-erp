import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { SimpleTexture } from '@/types/newTypes'

const createTextureSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim()
})

// GET /api/pricing/textures - Obtener todas las texturas
export async function GET() {
  try {
    const textures = await prisma.texture.findMany({
      orderBy: { name: 'asc' }
    })

    const serializedTextures: SimpleTexture[] = textures.map(texture => ({
      id: texture.id,
      name: texture.name,
      createdAt: texture.createdAt.toISOString(),
      updatedAt: texture.updatedAt.toISOString()
    }))

    return NextResponse.json(serializedTextures)
  } catch (error) {
    console.error('Error fetching textures:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/pricing/textures - Crear nueva textura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTextureSchema.parse(body)

    // Verificar que no exista una textura con el mismo nombre
    const existingTexture = await prisma.texture.findFirst({
      where: {
        name: validatedData.name
      }
    })

    if (existingTexture) {
      return NextResponse.json(
        { error: 'Ya existe una textura con ese nombre' },
        { status: 409 }
      )
    }

    const texture = await prisma.texture.create({
      data: {
        name: validatedData.name
      }
    })

    const serializedTexture: SimpleTexture = {
      id: texture.id,
      name: texture.name,
      createdAt: texture.createdAt.toISOString(),
      updatedAt: texture.updatedAt.toISOString()
    }

    return NextResponse.json(serializedTexture, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating texture:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
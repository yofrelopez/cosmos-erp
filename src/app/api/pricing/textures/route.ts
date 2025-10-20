import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { SimpleTexture } from '@/types/newTypes'

const createTextureSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').trim()
})

// GET /api/pricing/textures - Obtener todas las texturas
export async function GET(request: NextRequest) {
  try {
    const textures = await prisma.textures.findMany({
      where: {
        isActive: true
      },
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
    const existingTexture = await prisma.textures.findFirst({
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

    const texture = await prisma.textures.create({
      data: {
        name: validatedData.name,
        companyId: 1 // TODO: Obtener de la sesión del usuario
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
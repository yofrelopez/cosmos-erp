import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTextureSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
})

// PUT /api/pricing/textures/[id] - Actualizar textura
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const textureId = parseInt(params.id)

    if (isNaN(textureId)) {
      return NextResponse.json(
        { error: 'ID de textura inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateTextureSchema.parse(body)

    // Verificar que la textura existe
    const existingTexture = await prisma.textures.findUnique({
      where: { id: textureId }
    })

    if (!existingTexture) {
      return NextResponse.json(
        { error: 'Textura no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya existe otra textura con el mismo nombre
    const duplicateTexture = await prisma.textures.findFirst({
      where: { 
        name: validatedData.name,
        id: { not: textureId }
      }
    })

    if (duplicateTexture) {
      return NextResponse.json(
        { error: 'Ya existe una textura con ese nombre' },
        { status: 409 }
      )
    }

    // Actualizar la textura
    const updatedTexture = await prisma.textures.update({
      where: { id: textureId },
      data: {
        name: validatedData.name
      }
    })

    return NextResponse.json(updatedTexture)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating texture:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/pricing/textures/[id] - Eliminar textura
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const textureId = parseInt(params.id)

    if (isNaN(textureId)) {
      return NextResponse.json(
        { error: 'ID de textura inválido' },
        { status: 400 }
      )
    }

    // Verificar que la textura existe
    const existingTexture = await prisma.textures.findUnique({
      where: { id: textureId }
    })

    if (!existingTexture) {
      return NextResponse.json(
        { error: 'Textura no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar permanentemente (es solo un catálogo)
    await prisma.textures.delete({
      where: { id: textureId }
    })

    return NextResponse.json({ message: 'Textura eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting texture:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
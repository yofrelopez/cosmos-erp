import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const existingTexture = await prisma.texture.findUnique({
      where: { id: textureId }
    })

    if (!existingTexture) {
      return NextResponse.json(
        { error: 'Textura no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar permanentemente (es solo un catálogo)
    await prisma.texture.delete({
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
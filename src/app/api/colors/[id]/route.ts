import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/colors/[id] - Eliminar color
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const colorId = parseInt(id)

    if (isNaN(colorId)) {
      return NextResponse.json(
        { error: 'ID de color inválido' },
        { status: 400 }
      )
    }

    // Verificar que el color existe
    const existingColor = await prisma.color.findUnique({
      where: { id: colorId }
    })

    if (!existingColor) {
      return NextResponse.json(
        { error: 'Color no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el color está siendo usado en algún vidrio
    const usedInGlass = await prisma.pricingGlass.findFirst({
      where: { colorId: colorId }
    })

    if (usedInGlass) {
      return NextResponse.json(
        { error: 'No se puede eliminar el color porque está siendo usado en vidrios' },
        { status: 409 }
      )
    }

    // Eliminar el color
    await prisma.color.delete({
      where: { id: colorId }
    })

    return NextResponse.json({ message: 'Color eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting color:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
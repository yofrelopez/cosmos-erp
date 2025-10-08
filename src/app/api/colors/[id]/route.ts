import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateColorSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim()
})

// PUT /api/colors/[id] - Actualizar color
export async function PUT(
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

    const body = await request.json()
    const validatedData = updateColorSchema.parse(body)

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

    // Verificar si ya existe otro color con el mismo nombre
    const duplicateColor = await prisma.color.findFirst({
      where: { 
        name: validatedData.name,
        id: { not: colorId }
      }
    })

    if (duplicateColor) {
      return NextResponse.json(
        { error: 'Ya existe un color con ese nombre' },
        { status: 409 }
      )
    }

    // Actualizar el color
    const updatedColor = await prisma.color.update({
      where: { id: colorId },
      data: {
        name: validatedData.name
      }
    })

    return NextResponse.json(updatedColor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating color:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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
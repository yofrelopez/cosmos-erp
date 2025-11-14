import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseRouteId } from '@/lib/api-helpers'

const glassSchema = z.object({
  commercialName: z.string()
    .min(2, 'El nombre comercial debe tener al menos 2 caracteres')
    .max(100, 'El nombre comercial no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑ0-9\s\-\.]+$/, 'Solo se permiten letras, números, espacios, guiones y puntos')
    .trim(),
  family: z.enum(['PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO'], { message: 'La familia es requerida' }),
  thicknessMM: z.number().positive('El espesor debe ser mayor a 0'),
  colorType: z.enum(['INCOLORO', 'COLOR', 'POLARIZADO', 'REFLEJANTE'], { message: 'El tipo de color es requerido' }),
  colorId: z.number().optional(),
  price: z.number().positive('El precio debe ser mayor a 0')
})

// GET - Obtener vidrio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const glass = await prisma.pricingGlass.findUnique({
      where: { id },
      include: {
        colorRef: true
      }
    })

    if (!glass) {
      return NextResponse.json({ message: 'Vidrio no encontrado' }, { status: 404 })
    }

    // Serializar Decimal a number
    const serializedGlass = {
      ...glass,
      thicknessMM: Number(glass.thicknessMM),
      price: Number(glass.price),
      colorName: glass.colorRef?.name || null,
      validFrom: glass.validFrom.toISOString(),
      validTo: glass.validTo?.toISOString() || null,
      createdAt: glass.createdAt.toISOString(),
      updatedAt: glass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedGlass)
  } catch (error) {
    console.error('Error fetching glass:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar vidrio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)
    const body = await request.json()
    const validatedData = glassSchema.parse(body)

    const glass = await prisma.pricingGlass.update({
      where: { id },
      data: {
        commercialName: validatedData.commercialName,
        family: validatedData.family,
        thicknessMM: validatedData.thicknessMM,
        colorType: validatedData.colorType,
        colorId: validatedData.colorId || null,
        price: validatedData.price
      },
      include: {
        colorRef: true
      }
    })

    // Serializar Decimal a number
    const serializedGlass = {
      ...glass,
      thicknessMM: Number(glass.thicknessMM),
      price: Number(glass.price),
      colorName: glass.colorRef?.name || null,
      validFrom: glass.validFrom.toISOString(),
      validTo: glass.validTo?.toISOString() || null,
      createdAt: glass.createdAt.toISOString(),
      updatedAt: glass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedGlass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating glass:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar vidrio (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    await prisma.pricingGlass.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Vidrio eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting glass:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
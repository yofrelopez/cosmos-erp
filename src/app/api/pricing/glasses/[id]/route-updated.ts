import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { SerializedPricingGlass } from '@/types/newTypes'

const glassUpdateSchema = z.object({
  commercialName: z.string().min(2, 'El nombre comercial debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres').trim().optional(),
  family: z.enum(['PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO']).optional(),
  thicknessMM: z.number().positive('El espesor debe ser mayor a 0').optional(),
  colorType: z.enum(['INCOLORO', 'COLOR', 'POLARIZADO', 'REFLEJANTE']).optional(),
  colorId: z.number().positive().optional().nullable(),
  price: z.number().positive('El precio debe ser mayor a 0').optional(),
  isActive: z.boolean().optional()
})

// GET - Obtener vidrio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const glass = await prisma.pricingGlass.findUnique({
      where: { id },
      include: {
        colorRef: true
      }
    })

    if (!glass) {
      return NextResponse.json({ message: 'Vidrio no encontrado' }, { status: 404 })
    }

    const serializedGlass: SerializedPricingGlass = {
      id: glass.id,
      commercialName: glass.commercialName,
      family: glass.family,
      thicknessMM: Number(glass.thicknessMM),
      colorType: glass.colorType,
      colorId: glass.colorId,
      colorName: glass.colorRef?.name || null,
      price: Number(glass.price),
      companyId: glass.companyId,
      isActive: glass.isActive,
      validFrom: glass.validFrom.toISOString(),
      validTo: glass.validTo?.toISOString() || null,
      createdAt: glass.createdAt.toISOString(),
      updatedAt: glass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedGlass)
  } catch (error) {
    console.error('Error al obtener vidrio:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar vidrio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const validatedData = glassUpdateSchema.parse(body)

    const glass = await prisma.pricingGlass.update({
      where: { id },
      data: validatedData,
      include: {
        colorRef: true
      }
    })

    const serializedGlass: SerializedPricingGlass = {
      id: glass.id,
      commercialName: glass.commercialName,
      family: glass.family,
      thicknessMM: Number(glass.thicknessMM),
      colorType: glass.colorType,
      colorId: glass.colorId,
      colorName: glass.colorRef?.name || null,
      price: Number(glass.price),
      companyId: glass.companyId,
      isActive: glass.isActive,
      validFrom: glass.validFrom.toISOString(),
      validTo: glass.validTo?.toISOString() || null,
      createdAt: glass.createdAt.toISOString(),
      updatedAt: glass.updatedAt.toISOString()
    }

    return NextResponse.json(serializedGlass)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 })
    }
    
    console.error('Error al actualizar vidrio:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar vidrio (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.pricingGlass.update({
      where: { id },
      data: {
        isActive: false,
        validTo: new Date()
      }
    })

    return NextResponse.json({ message: 'Vidrio eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar vidrio:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}
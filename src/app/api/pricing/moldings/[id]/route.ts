import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseRouteId } from '@/lib/api-helpers'

const updateMoldingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  quality: z.enum(['SIMPLE', 'FINA', 'BASTIDOR'], { message: 'La calidad es requerida' }),
  thicknessId: z.number().int().positive('ID de espesor inválido'),
  pricePerM: z.number().positive('El precio debe ser mayor a 0'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Obtener moldura específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const molding = await prisma.pricingMolding.findUnique({
      where: { id },
      include: {
        thickness: true
      }
    })

    if (!molding) {
      return NextResponse.json(
        { message: 'Moldura no encontrada' },
        { status: 404 }
      )
    }

    // Serializar Decimal a number
    const serializedMolding = {
      ...molding,
      pricePerM: molding.pricePerM.toNumber(),
      thickness: {
        ...molding.thickness
      }
    }

    return NextResponse.json(serializedMolding)
  } catch (error) {
    console.error('Error fetching molding:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar moldura
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = updateMoldingSchema.parse(body)

    // Verificar que la moldura existe y pertenece a la empresa
    const existingMolding = await prisma.pricingMolding.findFirst({
      where: {
        id,
        companyId: validatedData.companyId
      }
    })

    if (!existingMolding) {
      return NextResponse.json(
        { message: 'Moldura no encontrada o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Verificar que el nuevo espesor existe y pertenece a la empresa
    const thickness = await prisma.pricingThickness.findFirst({
      where: {
        id: validatedData.thicknessId,
        companyId: validatedData.companyId
      }
    })

    if (!thickness) {
      return NextResponse.json(
        { message: 'Espesor no encontrado o no pertenece a la empresa' },
        { status: 400 }
      )
    }

    // Actualizar moldura
    const updatedMolding = await prisma.pricingMolding.update({
      where: { id },
      data: {
        name: validatedData.name,
        quality: validatedData.quality,
        thicknessId: validatedData.thicknessId,
        pricePerM: validatedData.pricePerM
      },
      include: {
        thickness: true
      }
    })

    // Serializar Decimal a number
    const serializedMolding = {
      ...updatedMolding,
      pricePerM: updatedMolding.pricePerM.toNumber(),
      thickness: {
        ...updatedMolding.thickness
      }
    }

    return NextResponse.json(serializedMolding)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Datos de entrada inválidos',
          errors: error.issues
        },
        { status: 400 }
      )
    }

    console.error('Error updating molding:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar moldura (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la moldura existe y pertenece a la empresa
    const existingMolding = await prisma.pricingMolding.findFirst({
      where: {
        id,
        companyId: parseInt(companyId)
      }
    })

    if (!existingMolding) {
      return NextResponse.json(
        { message: 'Moldura no encontrada o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Hard delete: eliminar completamente el registro
    await prisma.pricingMolding.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Moldura eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting molding:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
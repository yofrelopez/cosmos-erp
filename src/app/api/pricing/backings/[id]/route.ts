import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBackingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  pricePerFt2: z.number().positive('El precio debe ser mayor a 0'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Obtener soporte específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de soporte inválido' },
        { status: 400 }
      )
    }

    const backing = await prisma.pricingBacking.findUnique({
      where: { id }
    })

    if (!backing) {
      return NextResponse.json(
        { message: 'Soporte no encontrado' },
        { status: 404 }
      )
    }

    // Serializar Decimal a number
    const serializedBacking = {
      ...backing,
      pricePerFt2: backing.pricePerFt2.toNumber()
    }

    return NextResponse.json(serializedBacking)
  } catch (error) {
    console.error('Error fetching backing:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar soporte
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de soporte inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = updateBackingSchema.parse(body)

    // Verificar que el soporte existe y pertenece a la empresa
    const existingBacking = await prisma.pricingBacking.findFirst({
      where: {
        id,
        companyId: validatedData.companyId
      }
    })

    if (!existingBacking) {
      return NextResponse.json(
        { message: 'Soporte no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Actualizar soporte
    const updatedBacking = await prisma.pricingBacking.update({
      where: { id },
      data: {
        name: validatedData.name,
        pricePerFt2: validatedData.pricePerFt2
      }
    })

    // Serializar Decimal a number
    const serializedBacking = {
      ...updatedBacking,
      pricePerFt2: updatedBacking.pricePerFt2.toNumber()
    }

    return NextResponse.json(serializedBacking)
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

    console.error('Error updating backing:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar soporte (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de soporte inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el soporte existe y pertenece a la empresa
    const existingBacking = await prisma.pricingBacking.findFirst({
      where: {
        id,
        companyId: parseInt(companyId)
      }
    })

    if (!existingBacking) {
      return NextResponse.json(
        { message: 'Soporte no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Soft delete: marcar como inactivo
    await prisma.pricingBacking.update({
      where: { id },
      data: {
        isActive: false,
        validTo: new Date()
      }
    })

    return NextResponse.json({ message: 'Soporte eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting backing:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
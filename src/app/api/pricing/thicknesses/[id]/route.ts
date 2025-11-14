import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { parseRouteId } from '@/lib/api-helpers'

const updateThicknessSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Obtener espesor específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const thickness = await prisma.pricingThickness.findUnique({
      where: { id }
    })

    if (!thickness) {
      return NextResponse.json(
        { message: 'Espesor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(thickness)
  } catch (error) {
    console.error('Error fetching thickness:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar espesor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await parseRouteId(params)

    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = updateThicknessSchema.parse(body)

    // Verificar que el espesor existe y pertenece a la empresa
    const existingThickness = await prisma.pricingThickness.findFirst({
      where: {
        id,
        companyId: validatedData.companyId
      }
    })

    if (!existingThickness) {
      return NextResponse.json(
        { message: 'Espesor no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Verificar que no existe otro espesor con el mismo nombre
    const duplicateThickness = await prisma.pricingThickness.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId,
        id: { not: id }
      }
    })

    if (duplicateThickness) {
      return NextResponse.json(
        { message: 'Ya existe un espesor con ese nombre' },
        { status: 400 }
      )
    }

    // Actualizar espesor
    const updatedThickness = await prisma.pricingThickness.update({
      where: { id },
      data: {
        name: validatedData.name
      }
    })

    return NextResponse.json(updatedThickness)
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

    console.error('Error updating thickness:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar espesor (hard delete)
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

    // Verificar que el espesor existe y pertenece a la empresa
    const existingThickness = await prisma.pricingThickness.findFirst({
      where: {
        id,
        companyId: parseInt(companyId)
      }
    })

    if (!existingThickness) {
      return NextResponse.json(
        { message: 'Espesor no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Verificar si el espesor está siendo usado por molduras
    const usedInMoldings = await prisma.pricingMolding.findFirst({
      where: { thicknessId: id }
    })

    if (usedInMoldings) {
      return NextResponse.json(
        { message: 'No se puede eliminar: El espesor está siendo usado por molduras' },
        { status: 400 }
      )
    }

    // Hard delete: eliminar completamente
    await prisma.pricingThickness.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Espesor eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting thickness:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
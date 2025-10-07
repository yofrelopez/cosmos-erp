import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const thicknessSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Listar espesores por empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      )
    }

    const thicknesses = await prisma.pricingThickness.findMany({
      where: {
        companyId: parseInt(companyId)
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(thicknesses)
  } catch (error) {
    console.error('Error fetching thicknesses:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo espesor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = thicknessSchema.parse(body)

    // Verificar que no existe otro espesor con el mismo nombre para la misma empresa
    const existingThickness = await prisma.pricingThickness.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    if (existingThickness) {
      return NextResponse.json(
        { message: 'Ya existe un espesor con ese nombre' },
        { status: 400 }
      )
    }

    // Crear espesor
    const thickness = await prisma.pricingThickness.create({
      data: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    return NextResponse.json(thickness, { status: 201 })
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

    console.error('Error creating thickness:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const moldingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  quality: z.enum(['SIMPLE', 'FINA', 'BASTIDOR'], { message: 'La calidad es requerida' }),
  thicknessId: z.number().int().positive('ID de espesor inválido'),
  pricePerM: z.number().positive('El precio debe ser mayor a 0'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Listar molduras por empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const quality = searchParams.get('quality')
    const thicknessId = searchParams.get('thicknessId')

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      )
    }

    const where: any = {
      companyId: parseInt(companyId),
      isActive: true
    }

    // Filtros opcionales
    if (quality) {
      where.quality = quality
    }
    if (thicknessId) {
      where.thicknessId = parseInt(thicknessId)
    }

    const moldings = await prisma.pricingMolding.findMany({
      where,
      include: {
        thickness: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Serializar Decimal a number
    const serializedMoldings = moldings.map(molding => ({
      ...molding,
      pricePerM: molding.pricePerM.toNumber(),
      thickness: {
        ...molding.thickness
      }
    }))

    return NextResponse.json(serializedMoldings)
  } catch (error) {
    console.error('Error fetching moldings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva moldura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = moldingSchema.parse(body)

    // Verificar que el espesor existe y pertenece a la empresa
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

    // Crear moldura
    const molding = await prisma.pricingMolding.create({
      data: {
        name: validatedData.name,
        quality: validatedData.quality,
        thicknessId: validatedData.thicknessId,
        pricePerM: validatedData.pricePerM,
        companyId: validatedData.companyId,
        validFrom: new Date(),
        isActive: true
      },
      include: {
        thickness: true
      }
    })

    // Serializar Decimal a number
    const serializedMolding = {
      ...molding,
      pricePerM: molding.pricePerM.toNumber(),
      thickness: {
        ...molding.thickness
      }
    }

    return NextResponse.json(serializedMolding, { status: 201 })
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

    console.error('Error creating molding:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
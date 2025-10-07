import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const backingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  pricePerFt2: z.number().positive('El precio debe ser mayor a 0'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Listar soportes por empresa
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

    const backings = await prisma.pricingBacking.findMany({
      where: {
        companyId: parseInt(companyId),
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Serializar Decimal a number
    const serializedBackings = backings.map(backing => ({
      ...backing,
      pricePerFt2: backing.pricePerFt2.toNumber()
    }))

    return NextResponse.json(serializedBackings)
  } catch (error) {
    console.error('Error fetching backings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo soporte
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = backingSchema.parse(body)

    // Crear soporte
    const backing = await prisma.pricingBacking.create({
      data: {
        name: validatedData.name,
        pricePerFt2: validatedData.pricePerFt2,
        companyId: validatedData.companyId,
        validFrom: new Date(),
        isActive: true
      }
    })

    // Serializar Decimal a number
    const serializedBacking = {
      ...backing,
      pricePerFt2: backing.pricePerFt2.toNumber()
    }

    return NextResponse.json(serializedBacking, { status: 201 })
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

    console.error('Error creating backing:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
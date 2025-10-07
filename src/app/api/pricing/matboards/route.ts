// app/api/pricing/matboards/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMatboardSchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  pricePerFt2: z.number().positive('El precio por ft² debe ser mayor a 0'),
})

// GET - Listar matboards por empresa
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId es requerido' }, 
        { status: 400 }
      )
    }

    const matboards = await prisma.pricingMatboard.findMany({
      where: {
        companyId: parseInt(companyId),
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Serializar Decimal a number para el cliente
    const serializedMatboards = matboards.map(matboard => ({
      ...matboard,
      pricePerFt2: Number(matboard.pricePerFt2)
    }))

    return NextResponse.json(serializedMatboards)
  } catch (error) {
    console.error('Error fetching matboards:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo matboard
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createMatboardSchema.parse(body)

    // Verificar si ya existe un matboard con el mismo nombre para esta empresa
    const existingMatboard = await prisma.pricingMatboard.findFirst({
      where: {
        companyId: parsed.companyId,
        name: parsed.name,
        isActive: true,
      },
    })

    if (existingMatboard) {
      return NextResponse.json(
        { error: 'Ya existe un fondo con este nombre' },
        { status: 409 }
      )
    }

    const matboard = await prisma.pricingMatboard.create({
      data: {
        companyId: parsed.companyId,
        name: parsed.name,
        pricePerFt2: parsed.pricePerFt2,
      },
    })

    // Serializar para el cliente
    const serializedMatboard = {
      ...matboard,
      pricePerFt2: Number(matboard.pricePerFt2)
    }

    return NextResponse.json(serializedMatboard, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating matboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
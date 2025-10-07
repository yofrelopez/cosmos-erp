// app/api/pricing/accessories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAccessorySchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  price: z.number().positive('El precio debe ser mayor a 0'),
})

// GET - Listar accesorios por empresa
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

    const accessories = await prisma.pricingAccessory.findMany({
      where: {
        companyId: parseInt(companyId),
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Serializar Decimal a number para el cliente
    const serializedAccessories = accessories.map(accessory => ({
      ...accessory,
      price: Number(accessory.price)
    }))

    return NextResponse.json(serializedAccessories)
  } catch (error) {
    console.error('Error fetching accessories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo accesorio
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createAccessorySchema.parse(body)

    // Verificar si ya existe un accesorio con el mismo nombre para esta empresa
    const existingAccessory = await prisma.pricingAccessory.findFirst({
      where: {
        companyId: parsed.companyId,
        name: parsed.name,
        isActive: true,
      },
    })

    if (existingAccessory) {
      return NextResponse.json(
        { error: 'Ya existe un accesorio con este nombre' },
        { status: 409 }
      )
    }

    const accessory = await prisma.pricingAccessory.create({
      data: {
        companyId: parsed.companyId,
        name: parsed.name,
        price: parsed.price,
      },
    })

    // Serializar para el cliente
    const serializedAccessory = {
      ...accessory,
      price: Number(accessory.price)
    }

    return NextResponse.json(serializedAccessory, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating accessory:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
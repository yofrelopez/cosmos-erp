import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { SerializedPricingGlass } from '@/types/newTypes'

const glassSchema = z.object({
  commercialName: z.string()
    .min(2, 'El nombre comercial debe tener al menos 2 caracteres')
    .max(100, 'El nombre comercial no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúñÑ0-9\s\-\.]+$/, 'Solo se permiten letras, números, espacios, guiones y puntos')
    .trim(),
  family: z.enum(['PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO'], { message: 'La familia es requerida' }),
  thicknessMM: z.number().positive('El espesor debe ser mayor a 0'),
  colorType: z.enum(['INCOLORO', 'COLOR', 'POLARIZADO', 'REFLEJANTE'], { message: 'El tipo de color es requerido' }),
  colorId: z.number().positive().optional().nullable(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  companyId: z.number().positive()
})

// GET - Obtener todos los precios de vidrios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const commercialName = searchParams.get('commercialName')
    const family = searchParams.get('family')

    if (!companyId) {
      return NextResponse.json({ message: 'companyId es requerido' }, { status: 400 })
    }

    const whereClause: any = {
      companyId: parseInt(companyId),
      isActive: true
    }

    if (commercialName) {
      whereClause.commercialName = commercialName
    }

    if (family) {
      whereClause.family = family
    }

    const glasses = await prisma.pricingGlass.findMany({
      where: whereClause,
      include: {
        colorRef: true  // Incluir datos del color
      },
      orderBy: [
        { commercialName: 'asc' },
        { family: 'asc' },
        { thicknessMM: 'asc' },
        { colorType: 'asc' }
      ]
    })

    // Serializar Decimal a number y agregar nombre del color
    const serializedGlasses: SerializedPricingGlass[] = glasses.map(glass => ({
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
    }))

    return NextResponse.json(serializedGlasses)
  } catch (error) {
    console.error('Error al obtener vidrios:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nuevo precio de vidrio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = glassSchema.parse(body)

    // Verificar que no exista un vidrio similar activo
    const existingGlass = await prisma.pricingGlass.findFirst({
      where: {
        companyId: validatedData.companyId,
        commercialName: {
          equals: validatedData.commercialName,
          mode: 'insensitive'
        },
        family: validatedData.family,
        thicknessMM: validatedData.thicknessMM,
        colorType: validatedData.colorType,
        isActive: true
      }
    })

    if (existingGlass) {
      return NextResponse.json(
        { message: 'Ya existe un vidrio con estas características' },
        { status: 409 }
      )
    }

    const glass = await prisma.pricingGlass.create({
      data: {
        commercialName: validatedData.commercialName,
        family: validatedData.family,
        thicknessMM: validatedData.thicknessMM,
        colorType: validatedData.colorType,
        colorId: validatedData.colorId,
        price: validatedData.price,
        companyId: validatedData.companyId
      },
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

    return NextResponse.json(serializedGlass, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Datos inválidos', errors: error.issues }, { status: 400 })
    }
    
    console.error('Error al crear vidrio:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}
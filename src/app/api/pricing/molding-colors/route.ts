import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const moldingColorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Listar colores por empresa
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

    const colors = await prisma.moldingColors.findMany({
      where: {
        companyId: parseInt(companyId)
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(colors)
  } catch (error) {
    console.error('Error fetching molding colors:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo color
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = moldingColorSchema.parse(body)

    // Verificar que no existe ya un color con el mismo nombre para la empresa
    const existing = await prisma.moldingColors.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Ya existe un color con ese nombre en esta empresa' },
        { status: 400 }
      )
    }

    // Crear color
    const color = await prisma.moldingColors.create({
      data: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    return NextResponse.json(color, { status: 201 })
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

    console.error('Error creating molding color:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const moldingTextureSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Listar texturas por empresa
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

    const textures = await prisma.moldingTextures.findMany({
      where: {
        companyId: parseInt(companyId)
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(textures)
  } catch (error) {
    console.error('Error fetching molding textures:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva textura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = moldingTextureSchema.parse(body)

    // Verificar que no existe ya una textura con el mismo nombre para la empresa
    const existing = await prisma.moldingTextures.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Ya existe una textura con ese nombre en esta empresa' },
        { status: 400 }
      )
    }

    // Crear textura
    const texture = await prisma.moldingTextures.create({
      data: {
        name: validatedData.name,
        companyId: validatedData.companyId
      }
    })

    return NextResponse.json(texture, { status: 201 })
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

    console.error('Error creating molding texture:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
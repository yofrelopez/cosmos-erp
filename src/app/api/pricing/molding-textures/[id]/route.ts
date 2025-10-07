import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTextureSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Obtener textura específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de textura inválido' },
        { status: 400 }
      )
    }

    const texture = await prisma.moldingTexture.findUnique({
      where: { id }
    })

    if (!texture) {
      return NextResponse.json(
        { message: 'Textura no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(texture)
  } catch (error) {
    console.error('Error fetching texture:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar textura
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de textura inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = updateTextureSchema.parse(body)

    // Verificar que la textura existe y pertenece a la empresa
    const existingTexture = await prisma.moldingTexture.findFirst({
      where: {
        id,
        companyId: validatedData.companyId
      }
    })

    if (!existingTexture) {
      return NextResponse.json(
        { message: 'Textura no encontrada o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Verificar duplicado de nombre (excluyendo la textura actual)
    const duplicate = await prisma.moldingTexture.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId,
        id: { not: id }
      }
    })

    if (duplicate) {
      return NextResponse.json(
        { message: 'Ya existe una textura con ese nombre en esta empresa' },
        { status: 400 }
      )
    }

    // Actualizar textura
    const updatedTexture = await prisma.moldingTexture.update({
      where: { id },
      data: {
        name: validatedData.name
      }
    })

    return NextResponse.json(updatedTexture)
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

    console.error('Error updating texture:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar textura
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de textura inválido' },
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

    // Verificar que la textura existe y pertenece a la empresa
    const existingTexture = await prisma.moldingTexture.findFirst({
      where: {
        id,
        companyId: parseInt(companyId)
      }
    })

    if (!existingTexture) {
      return NextResponse.json(
        { message: 'Textura no encontrada o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Eliminar textura
    await prisma.moldingTexture.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Textura eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting texture:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
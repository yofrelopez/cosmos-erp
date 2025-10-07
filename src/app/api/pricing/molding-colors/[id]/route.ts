import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateColorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  companyId: z.number().int().positive('ID de empresa inválido')
})

// GET - Obtener color específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de color inválido' },
        { status: 400 }
      )
    }

    const color = await prisma.moldingColor.findUnique({
      where: { id }
    })

    if (!color) {
      return NextResponse.json(
        { message: 'Color no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(color)
  } catch (error) {
    console.error('Error fetching color:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar color
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de color inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validar datos con Zod
    const validatedData = updateColorSchema.parse(body)

    // Verificar que el color existe y pertenece a la empresa
    const existingColor = await prisma.moldingColor.findFirst({
      where: {
        id,
        companyId: validatedData.companyId
      }
    })

    if (!existingColor) {
      return NextResponse.json(
        { message: 'Color no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Verificar duplicado de nombre (excluyendo el color actual)
    const duplicate = await prisma.moldingColor.findFirst({
      where: {
        name: validatedData.name,
        companyId: validatedData.companyId,
        id: { not: id }
      }
    })

    if (duplicate) {
      return NextResponse.json(
        { message: 'Ya existe un color con ese nombre en esta empresa' },
        { status: 400 }
      )
    }

    // Actualizar color
    const updatedColor = await prisma.moldingColor.update({
      where: { id },
      data: {
        name: validatedData.name
      }
    })

    return NextResponse.json(updatedColor)
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

    console.error('Error updating color:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar color
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: 'ID de color inválido' },
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

    // Verificar que el color existe y pertenece a la empresa
    const existingColor = await prisma.moldingColor.findFirst({
      where: {
        id,
        companyId: parseInt(companyId)
      }
    })

    if (!existingColor) {
      return NextResponse.json(
        { message: 'Color no encontrado o no pertenece a la empresa' },
        { status: 404 }
      )
    }

    // Eliminar color
    await prisma.moldingColor.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Color eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting color:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
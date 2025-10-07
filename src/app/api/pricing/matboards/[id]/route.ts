// app/api/pricing/matboards/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMatboardSchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  pricePerFt2: z.number().positive().optional(),
})

const deleteMatboardSchema = z.object({
  companyId: z.number().int().positive(),
})

// GET - Obtener matboard por ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const matboard = await prisma.pricingMatboard.findUnique({
      where: { id },
    })

    if (!matboard) {
      return NextResponse.json(
        { error: 'Fondo no encontrado' },
        { status: 404 }
      )
    }

    const serializedMatboard = {
      ...matboard,
      pricePerFt2: Number(matboard.pricePerFt2)
    }

    return NextResponse.json(serializedMatboard)
  } catch (error) {
    console.error('Error fetching matboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar matboard
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parsed = updateMatboardSchema.parse(body)

    // Verificar que el matboard pertenece a la empresa
    const existingMatboard = await prisma.pricingMatboard.findFirst({
      where: {
        id,
        companyId: parsed.companyId,
      },
    })

    if (!existingMatboard) {
      return NextResponse.json(
        { error: 'Fondo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar nombre único si se está cambiando
    if (parsed.name && parsed.name !== existingMatboard.name) {
      const nameExists = await prisma.pricingMatboard.findFirst({
        where: {
          companyId: parsed.companyId,
          name: parsed.name,
          isActive: true,
          id: { not: id },
        },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un fondo con este nombre' },
          { status: 409 }
        )
      }
    }

    const updatedMatboard = await prisma.pricingMatboard.update({
      where: { id },
      data: {
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.pricePerFt2 && { pricePerFt2: parsed.pricePerFt2 }),
      },
    })

    const serializedMatboard = {
      ...updatedMatboard,
      pricePerFt2: Number(updatedMatboard.pricePerFt2)
    }

    return NextResponse.json(serializedMatboard)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating matboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desactivar matboard (soft delete)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parsed = deleteMatboardSchema.parse(body)

    // Verificar que el matboard pertenece a la empresa
    const existingMatboard = await prisma.pricingMatboard.findFirst({
      where: {
        id,
        companyId: parsed.companyId,
      },
    })

    if (!existingMatboard) {
      return NextResponse.json(
        { error: 'Fondo no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - desactivar en lugar de eliminar
    await prisma.pricingMatboard.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Fondo eliminado correctamente' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error deleting matboard:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
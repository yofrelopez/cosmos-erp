// app/api/pricing/accessories/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAccessorySchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
})

const deleteAccessorySchema = z.object({
  companyId: z.number().int().positive(),
})

// GET - Obtener accesorio por ID
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

    const accessory = await prisma.pricingAccessory.findUnique({
      where: { id },
    })

    if (!accessory) {
      return NextResponse.json(
        { error: 'Accesorio no encontrado' },
        { status: 404 }
      )
    }

    const serializedAccessory = {
      ...accessory,
      price: Number(accessory.price)
    }

    return NextResponse.json(serializedAccessory)
  } catch (error) {
    console.error('Error fetching accessory:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar accesorio
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
    const parsed = updateAccessorySchema.parse(body)

    // Verificar que el accesorio pertenece a la empresa
    const existingAccessory = await prisma.pricingAccessory.findFirst({
      where: {
        id,
        companyId: parsed.companyId,
      },
    })

    if (!existingAccessory) {
      return NextResponse.json(
        { error: 'Accesorio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar nombre único si se está cambiando
    if (parsed.name && parsed.name !== existingAccessory.name) {
      const nameExists = await prisma.pricingAccessory.findFirst({
        where: {
          companyId: parsed.companyId,
          name: parsed.name,
          isActive: true,
          id: { not: id },
        },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un accesorio con este nombre' },
          { status: 409 }
        )
      }
    }

    const updatedAccessory = await prisma.pricingAccessory.update({
      where: { id },
      data: {
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.price && { price: parsed.price }),
      },
    })

    const serializedAccessory = {
      ...updatedAccessory,
      price: Number(updatedAccessory.price)
    }

    return NextResponse.json(serializedAccessory)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating accessory:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desactivar accesorio (soft delete)
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
    const parsed = deleteAccessorySchema.parse(body)

    // Verificar que el accesorio pertenece a la empresa
    const existingAccessory = await prisma.pricingAccessory.findFirst({
      where: {
        id,
        companyId: parsed.companyId,
      },
    })

    if (!existingAccessory) {
      return NextResponse.json(
        { error: 'Accesorio no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - desactivar en lugar de eliminar
    await prisma.pricingAccessory.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Accesorio eliminado correctamente' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error deleting accessory:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
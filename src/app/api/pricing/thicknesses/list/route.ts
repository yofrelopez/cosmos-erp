import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener espesores disponibles para una empresa
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

    const thicknesses = await prisma.pricingThickness.findMany({
      where: {
        companyId: parseInt(companyId),
        isActive: true
      },
      select: {
        id: true,
        name: true,
        category: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(thicknesses)
  } catch (error) {
    console.error('Error fetching thicknesses:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
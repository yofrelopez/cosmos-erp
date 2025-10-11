import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener espesores que tienen molduras de una calidad específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const quality = searchParams.get('quality')

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID es requerido' },
        { status: 400 }
      )
    }

    if (!quality) {
      return NextResponse.json(
        { message: 'Quality es requerida' },
        { status: 400 }
      )
    }

    // Obtener espesores únicos que tienen molduras de la calidad especificada
    const thicknesses = await prisma.pricingThickness.findMany({
      where: {
        companyId: parseInt(companyId),
        moldings: {
          some: {
            quality: quality as any,
            companyId: parseInt(companyId)
          }
        }
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(thicknesses)
  } catch (error) {
    console.error('Error fetching thicknesses by quality:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
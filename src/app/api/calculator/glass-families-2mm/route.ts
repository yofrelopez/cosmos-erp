import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener familias de vidrios que tienen al menos un vidrio de 2mm activo
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

    console.log(`API glass-families-2mm - Request params: companyId=${companyId}`)

    // Obtener familias únicas que tienen vidrios de 2mm activos
    const families = await prisma.pricingGlass.findMany({
      where: {
        companyId: parseInt(companyId),
        thicknessMM: 2,
        isActive: true
      },
      select: {
        family: true
      },
      distinct: ['family'],
      orderBy: {
        family: 'asc'
      }
    })

    console.log(`API glass-families-2mm - Found families:`, families)

    return NextResponse.json(families)
  } catch (error) {
    console.error('Error fetching glass families for 2mm:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
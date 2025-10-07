// API: /api/calculator/glasses
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = Number(searchParams.get('companyId'))
  const family = searchParams.get('family') as 'PLANO' | 'CATEDRAL' | 'TEMPLADO' | 'ESPEJO' | null
  const thicknessMM = searchParams.get('thickness') ? Number(searchParams.get('thickness')) : undefined
  const colorType = searchParams.get('colorType') as 'INCOLORO' | 'COLOR' | 'POLARIZADO' | 'REFLEJANTE' | null
  const colorId = searchParams.get('colorId') ? Number(searchParams.get('colorId')) : undefined
  const search = searchParams.get('search') || ''

  try {
    // Construir filtros dinámicamente
    const where: any = {
      companyId,
      isActive: true
    }

    if (family) where.family = family
    if (thicknessMM) where.thicknessMM = thicknessMM
    if (colorType) where.colorType = colorType
    // NO filtrar por colorId - es solo para información de cotización
    // if (colorId) where.colorId = colorId
    if (search) {
      where.commercialName = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const glasses = await prisma.pricingGlass.findMany({
      where,
      include: {
        colorRef: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { family: 'asc' },
        { thicknessMM: 'asc' },
        { colorType: 'asc' },
        { commercialName: 'asc' }
      ]
    })

    // Serializar para el frontend
    const serializedGlasses = glasses.map(glass => ({
      id: glass.id,
      commercialName: glass.commercialName,
      family: glass.family,
      thicknessMM: Number(glass.thicknessMM),
      colorType: glass.colorType,
      colorId: glass.colorId,
      colorName: glass.colorRef?.name || null,
      unitPrice: Number(glass.price), // Cambiado de 'price' a 'unitPrice'
      validFrom: glass.validFrom.toISOString(),
      validTo: glass.validTo?.toISOString() || null,
      isActive: glass.isActive
    }))

    return NextResponse.json(serializedGlasses)

  } catch (error) {
    console.error('Error fetching glasses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
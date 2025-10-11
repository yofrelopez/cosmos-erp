import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener calidades de molduras que realmente existen
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

    // Obtener calidades únicas que tienen molduras
    const qualitiesData = await prisma.pricingMolding.findMany({
      where: {
        companyId: parseInt(companyId)
      },
      select: {
        quality: true
      },
      distinct: ['quality']
    })

    // Mapear a formato esperado por el frontend
    const qualityLabels: Record<string, string> = {
      'SIMPLE': '🔹 Simple',
      'FINA': '✨ Fina',
      'BASTIDOR': '🔲 Bastidor'
    }

    const qualities = qualitiesData.map(item => ({
      value: item.quality,
      label: qualityLabels[item.quality] || item.quality
    }))

    return NextResponse.json(qualities)
  } catch (error) {
    console.error('Error fetching available qualities:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
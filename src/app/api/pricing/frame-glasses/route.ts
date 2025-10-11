import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener vidrios para cuadros: cristales fijos + espejos dinámicos
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

    // 1. Vidrios fijos (hardcodeados)
    const cristalTransparente = await prisma.pricingGlass.findFirst({
      where: {
        companyId: parseInt(companyId),
        family: 'PLANO',
        thicknessMM: 2,
        colorType: 'INCOLORO',
        isActive: true
      },
      select: {
        id: true,
        commercialName: true,
        price: true
      }
    })

    const cristalMate = await prisma.pricingGlass.findFirst({
      where: {
        companyId: parseInt(companyId),
        family: 'PLANO',
        thicknessMM: 2,
        colorType: 'COLOR',
        isActive: true
      },
      select: {
        id: true,
        commercialName: true,
        price: true
      }
    })

    // 2. Espejos dinámicos (2mm y 3mm) - mostrar todos los disponibles
    const espejos = await prisma.pricingGlass.findMany({
      where: {
        companyId: parseInt(companyId),
        family: 'ESPEJO',
        thicknessMM: { in: [2, 3] },
        isActive: true
      },
      select: {
        id: true,
        commercialName: true,
        thicknessMM: true,
        price: true
      },
      orderBy: [
        { thicknessMM: 'asc' },
        { price: 'asc' }
      ]
    })

    // 3. Combinar en una lista ordenada
    const frameGlasses = []

    // Agregar vidrios (con fallback si no existen)
    if (cristalTransparente) {
      frameGlasses.push({
        id: cristalTransparente.id,
        name: cristalTransparente.commercialName || '🪟 Cristal 2mm Transparente',
        category: 'VIDRIO',
        thickness: 2,
        unitPrice: Number(cristalTransparente.price),
        isDefault: true
      })
    }

    if (cristalMate) {
      frameGlasses.push({
        id: cristalMate.id,
        name: cristalMate.commercialName || '🎨 Cristal 2mm Mate',
        category: 'VIDRIO',
        thickness: 2,
        unitPrice: Number(cristalMate.price),
        isDefault: false
      })
    }

    // Agregar espejos
    espejos.forEach(espejo => {
      const displayName = espejo.commercialName 
        ? `✨ ${espejo.commercialName} (${espejo.thicknessMM}mm)`
        : `✨ Espejo ${espejo.thicknessMM}mm`;
        
      frameGlasses.push({
        id: espejo.id,
        name: displayName,
        category: 'ESPEJO',
        thickness: Number(espejo.thicknessMM),
        unitPrice: Number(espejo.price),
        isDefault: false
      })
    })

    return NextResponse.json(frameGlasses)
  } catch (error) {
    console.error('Error fetching frame glasses:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
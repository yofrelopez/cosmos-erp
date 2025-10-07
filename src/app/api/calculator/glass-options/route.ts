// API: /api/calculator/glass-options
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = Number(searchParams.get('companyId'))
  const family = searchParams.get('family') as 'PLANO' | 'CATEDRAL' | 'TEMPLADO' | 'ESPEJO' | null
  const thicknessMM = searchParams.get('thickness') ? Number(searchParams.get('thickness')) : undefined
  const colorType = searchParams.get('colorType') as 'INCOLORO' | 'COLOR' | 'POLARIZADO' | 'REFLEJANTE' | null

  console.log('API glass-options - Request params:', {
    companyId,
    family,
    thicknessMM,
    colorType,
    url: request.url
  });

  try {
    // 1. Si no hay filtros, devolver familias disponibles
    if (!family) {
      const families = await prisma.pricingGlass.findMany({
        where: { companyId, isActive: true },
        select: { family: true },
        distinct: ['family']
      })
      
      console.log('API glass-options - Found families:', families);
      
      return NextResponse.json({
        families: families.map(f => f.family)
      })
    }

    // 2. Si hay familia, devolver espesores disponibles
    if (family && !thicknessMM) {
      const thicknesses = await prisma.pricingGlass.findMany({
        where: { companyId, isActive: true, family },
        select: { thicknessMM: true },
        distinct: ['thicknessMM'],
        orderBy: { thicknessMM: 'asc' }
      })
      
      console.log('API glass-options - Found thicknesses:', thicknesses);
      
      return NextResponse.json({
        thicknesses: thicknesses.map(t => Number(t.thicknessMM))
      })
    }

    // 3. Si hay familia + espesor, devolver colorTypes disponibles
    if (family && thicknessMM && !colorType) {
      const colorTypes = await prisma.pricingGlass.findMany({
        where: { companyId, isActive: true, family, thicknessMM },
        select: { colorType: true },
        distinct: ['colorType']
      })
      
      console.log('API glass-options - Found colorTypes:', colorTypes);
      
      return NextResponse.json({
        colorTypes: colorTypes.map(c => c.colorType)
      })
    }

    // 4. Si tenemos familia + espesor + colorType, devolver información completa
    if (family && thicknessMM && colorType) {
      const response: any = {}

      // Si colorType no es INCOLORO, obtener colores específicos
      if (colorType !== 'INCOLORO') {
        const glassesWithColors = await prisma.pricingGlass.findMany({
          where: { 
            companyId, 
            isActive: true, 
            family, 
            thicknessMM, 
            colorType: colorType as any,
            colorId: { not: null }
          },
          select: {
            colorId: true
          },
          distinct: ['colorId']
        })

        const colorIds = glassesWithColors.map(g => g.colorId).filter(Boolean) as number[]
        
        if (colorIds.length > 0) {
          const colors = await prisma.color.findMany({
            where: {
              id: { in: colorIds }
            },
            select: {
              id: true,
              name: true
            },
            orderBy: { name: 'asc' }
          })
          response.colors = colors
        } else {
          // Si no hay colores específicos en BD, devolver todos los colores disponibles
          const allColors = await prisma.color.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
          })
          response.colors = allColors
        }
      }

      // Si familia soporta texturas, agregarlas
      if (['CATEDRAL'].includes(family)) {
        const textures = await prisma.texture.findMany({
          orderBy: { name: 'asc' }
        })
        response.textures = textures
      }

      console.log('API glass-options - Complete response:', response);

      return NextResponse.json(response)
    }

    // 6. Devolver respuesta por defecto con estructura completa
    const baseResponse: any = {}
    
    // Si no hay familia, siempre incluir las familias disponibles
    if (!family) {
      const families = await prisma.pricingGlass.findMany({
        where: { companyId, isActive: true },
        select: { family: true },
        distinct: ['family']
      })
      baseResponse.families = families.map(f => f.family)
    }

    return NextResponse.json(baseResponse)

  } catch (error) {
    console.error('Error fetching glass options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
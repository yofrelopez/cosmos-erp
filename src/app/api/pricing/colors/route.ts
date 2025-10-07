import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los colores
export async function GET(request: NextRequest) {
  try {
    const colors = await prisma.color.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(colors)
  } catch (error) {
    console.error('Error fetching colors:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
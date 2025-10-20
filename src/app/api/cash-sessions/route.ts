import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET /api/cash-sessions - Obtener sesiones de caja
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Obtener la empresa del usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json(
        { error: 'Usuario no tiene empresa asignada' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {
      companyId: user.companyId
    }

    // Filtrar por rango de fechas si se proporciona
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const sessions = await prisma.cashSession.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc'
      },
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        closedBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        _count: {
          select: {
            movements: true
          }
        }
      }
    })

    return NextResponse.json({
      sessions: sessions.map(session => ({
        ...session,
        initialFund: session.initialFund.toNumber(),
        finalAmount: session.finalAmount?.toNumber() || null
      }))
    })

  } catch (error) {
    console.error('Error fetching cash sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cash-sessions - Crear nueva sesión de caja
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Obtener la empresa del usuario autenticado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    if (!user?.companyId) {
      return NextResponse.json(
        { error: 'Usuario no tiene empresa asignada' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { date, initialFund, notes } = body

    if (!date || initialFund === undefined) {
      return NextResponse.json(
        { error: 'Fecha y fondo inicial son requeridos' },
        { status: 400 }
      )
    }

    const targetDate = new Date(date)
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())

    // Verificar que no exista una sesión para ese día
    const existingSession = await prisma.cashSession.findUnique({
      where: {
        companyId_date: {
          companyId: user.companyId,
          date: dateOnly
        }
      }
    })

    if (existingSession) {
      return NextResponse.json(
        { error: 'Ya existe una sesión de caja para esta fecha' },
        { status: 400 }
      )
    }

    // Crear nueva sesión de caja
    const newSession = await prisma.cashSession.create({
      data: {
        companyId: user.companyId,
        date: dateOnly,
        initialFund,
        notes: notes || null,
        openedById: session.user.id,
        isOpen: true
      },
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      session: {
        ...newSession,
        initialFund: newSession.initialFund.toNumber()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating cash session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
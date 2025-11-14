import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { parseRouteId } from '@/lib/api-helpers'

// GET /api/cash-sessions/[id] - Obtener sesión específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const sessionId = await parseRouteId(params)

    // Buscar sesión que pertenezca a la empresa del usuario
    const cashSession = await prisma.cashSession.findFirst({
      where: { 
        id: sessionId,
        companyId: user.companyId
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
        movements: {
          orderBy: {
            date: 'desc'
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        }
      }
    })

    if (!cashSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: {
        ...cashSession,
        initialFund: cashSession.initialFund.toNumber(),
        finalAmount: cashSession.finalAmount?.toNumber() || null,
        movements: cashSession.movements.map(movement => ({
          ...movement,
          amount: movement.amount.toNumber()
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching cash session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/cash-sessions/[id] - Actualizar sesión (cerrar caja)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const sessionId = await parseRouteId(params)

    const body = await request.json()
    const { finalAmount, notes, action } = body

    // Verificar que la sesión existe y pertenece a la empresa del usuario
    const existingSession = await prisma.cashSession.findFirst({
      where: { 
        id: sessionId,
        companyId: user.companyId
      }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    if (action === 'close') {
      if (finalAmount === undefined) {
        return NextResponse.json(
          { error: 'Monto final es requerido para cerrar la caja' },
          { status: 400 }
        )
      }

      updateData = {
        finalAmount,
        notes: notes || null,
        closedAt: new Date(),
        closedById: session.user.id,
        isOpen: false
      }
    } else if (action === 'reopen') {
      updateData = {
        closedAt: null,
        closedById: null,
        isOpen: true
      }
    } else {
      // Actualización general (notas, etc.)
      if (notes !== undefined) updateData.notes = notes
      if (finalAmount !== undefined) updateData.finalAmount = finalAmount
    }

    // Actualizar la sesión
    const updatedSession = await prisma.cashSession.update({
      where: { id: sessionId },
      data: updateData,
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
        }
      }
    })

    return NextResponse.json({
      session: {
        ...updatedSession,
        initialFund: updatedSession.initialFund.toNumber(),
        finalAmount: updatedSession.finalAmount?.toNumber() || null
      }
    })

  } catch (error) {
    console.error('Error updating cash session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
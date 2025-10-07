import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ToggleStatusRequest {
  userId: string
  isActive: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo Super Admin puede cambiar el estado de usuarios
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'No tienes permisos para cambiar el estado de usuarios' },
        { status: 403 }
      )
    }

    const body: ToggleStatusRequest = await request.json()

    if (!body.userId || typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir desactivar Super Admin
    if (user.role === 'SUPER_ADMIN' && !body.isActive) {
      return NextResponse.json(
        { message: 'No se puede desactivar un Super Administrador' },
        { status: 400 }
      )
    }

    // No permitir que se desactive a sí mismo
    if (user.id === session.user.id && !body.isActive) {
      return NextResponse.json(
        { message: 'No puedes desactivarte a ti mismo' },
        { status: 400 }
      )
    }

    // Actualizar el estado del usuario
    const updatedUser = await prisma.user.update({
      where: { id: body.userId },
      data: { isActive: body.isActive },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            ruc: true,
            status: true,
          }
        }
      }
    })

    // Remover la contraseña de la respuesta
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      message: `Usuario ${body.isActive ? 'activado' : 'desactivado'} correctamente`,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
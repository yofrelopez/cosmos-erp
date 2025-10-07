import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

interface CreateUserRequest {
  email: string
  name: string
  username: string
  password: string
  phone?: string
  role: UserRole
  companyId?: number
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

    // Solo Super Admin puede crear usuarios
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'No tienes permisos para crear usuarios' },
        { status: 403 }
      )
    }

    const body: CreateUserRequest = await request.json()

    // Validaciones básicas
    if (!body.email || !body.name || !body.username || !body.password || !body.role) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar que el email no esté en uso
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Validar que el username no esté en uso
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: body.username }
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con este nombre de usuario' },
        { status: 400 }
      )
    }

    // Validar que si no es Super Admin, tenga una empresa asignada
    if (body.role !== 'SUPER_ADMIN' && !body.companyId) {
      return NextResponse.json(
        { message: 'Los usuarios que no son Super Admin deben tener una empresa asignada' },
        { status: 400 }
      )
    }

    // Validar que la empresa existe si se proporciona
    if (body.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: body.companyId }
      })

      if (!company) {
        return NextResponse.json(
          { message: 'La empresa seleccionada no existe' },
          { status: 400 }
        )
      }

      if (company.status !== 'ACTIVE') {
        return NextResponse.json(
          { message: 'No se puede asignar a una empresa inactiva' },
          { status: 400 }
        )
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        username: body.username,
        password: hashedPassword,
        phone: body.phone || null,
        role: body.role,
        companyId: body.role === 'SUPER_ADMIN' ? null : body.companyId,
        isActive: true,
      },
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
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json({
      message: 'Usuario creado correctamente',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminPassword() {
  console.log('🔐 Actualizando password del admin...')
  
  try {
    // Encriptar la password
    const hashedPassword = await bcrypt.hash('admin50cosmos', 12)
    
    // Actualizar el usuario admin
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@vdcosmos.com'
      },
      data: {
        password: hashedPassword
      }
    })
    
    console.log('✅ Password actualizada exitosamente')
    console.log(`📧 Usuario: ${updatedUser.email}`)
    console.log(`👤 Nombre: ${updatedUser.name}`)
    console.log(`🏢 Rol: ${updatedUser.role}`)
    console.log(`🔑 Password: admin50cosmos (encriptada)`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
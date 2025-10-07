import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  try {
    const superAdmin = await prisma.user.create({
      data: {
        id: 'super-admin-cosmos',
        name: 'Super Administrador',
        email: 'admin@cosmos.com',
        username: 'superadmin',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Super Admin creado:', superAdmin.email)
    console.log('📧 Email: admin@cosmos.com')
    console.log('🔐 Password: admin123')
  } catch (error) {
    console.error('❌ Error creando Super Admin:', error)
  }
}

createSuperAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
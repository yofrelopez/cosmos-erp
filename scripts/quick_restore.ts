import { PrismaClient } from '@prisma/client'
import fs from 'fs'

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Restaurando datos esenciales...')
    
    const backupData = JSON.parse(fs.readFileSync('backup-real-data-2025-10-18T15-52-13-277Z.json', 'utf8'))
    
    // Solo restaurar lo esencial primero
    await prisma.company.create({ data: backupData.companies[0] })
    console.log('✅ Company restaurada')
    
    await prisma.user.create({ data: backupData.users[0] })
    console.log('✅ User restaurado')
    
    console.log('🎉 Datos esenciales restaurados!')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
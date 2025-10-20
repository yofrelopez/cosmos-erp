import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const companyCount = await prisma.company.count()
    const userCount = await prisma.user.count()
    console.log('companyCount=', companyCount)
    console.log('userCount=', userCount)
  } catch (e) {
    console.error('Error running counts:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()

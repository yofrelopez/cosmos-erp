// Script para sembrar colores básicos
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedColors() {
  const colors = [
    'Gris',
    'Ámbar', 
    'Azul',
    'Verde',
    'Bronce',
    'Humo',
    'Dorado',
    'Plata'
  ]

  for (const colorName of colors) {
    try {
      await prisma.color.upsert({
        where: { name: colorName },
        update: {},
        create: { name: colorName }
      })
      console.log(`✅ Color "${colorName}" agregado`)
    } catch (error) {
      console.log(`⚠️  Color "${colorName}" ya existe o error:`, error.message)
    }
  }

  console.log('\n📊 Colores en base de datos:')
  const allColors = await prisma.color.findMany({ orderBy: { name: 'asc' } })
  console.log(allColors.map(c => `- ${c.name}`).join('\n'))
}

seedColors()
  .then(() => {
    console.log('\n✅ Seeding completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
// Seed data for glass pricing, colors and textures
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedGlassData() {
  console.log('🌱 Seeding glass data...')

  // Obtener todas las empresas activas
  const companies = await prisma.company.findMany({
    where: { status: 'ACTIVE' }
  })

  if (companies.length === 0) {
    console.log('❌ No active companies found')
    return
  }

  console.log(`📊 Found ${companies.length} active companies`)

  // 1. Crear colores básicos
  const colors = [
    'Incoloro',
    'Verde',
    'Azul',
    'Bronce',
    'Gris',
    'Negro',
    'Dorado',
    'Plata',
    'Rojo',
    'Amarillo'
  ]

  console.log('🎨 Creating colors...')
  for (const colorName of colors) {
    await prisma.color.upsert({
      where: { name: colorName },
      update: {},
      create: { name: colorName }
    })
  }

  // 2. Crear texturas básicas
  const textures = [
    'Liso',
    'Cuadriculado',
    'Llovizna',
    'Garatachi',
    'Flora',
    'Marihuana',
    'Ramas'
  ]

  console.log('🌊 Creating textures...')
  for (const textureName of textures) {
    await prisma.texture.upsert({
      where: { name: textureName },
      update: {},
      create: { name: textureName }
    })
  }

  // 3. Crear precios de vidrios para cada empresa
  const glassesData = [
    // Vidrios Planos
    { commercialName: 'Cristal Float', family: 'PLANO', thickness: 3, colorType: 'INCOLORO', price: 25.50 },
    { commercialName: 'Cristal Float', family: 'PLANO', thickness: 4, colorType: 'INCOLORO', price: 32.00 },
    { commercialName: 'Cristal Float', family: 'PLANO', thickness: 5, colorType: 'INCOLORO', price: 38.75 },
    { commercialName: 'Cristal Float', family: 'PLANO', thickness: 6, colorType: 'INCOLORO', price: 45.50 },
    { commercialName: 'Cristal Float Verde', family: 'PLANO', thickness: 4, colorType: 'COLOR', color: 'Verde', price: 42.00 },
    { commercialName: 'Cristal Float Azul', family: 'PLANO', thickness: 4, colorType: 'COLOR', color: 'Azul', price: 42.00 },
    { commercialName: 'Cristal Float Bronce', family: 'PLANO', thickness: 4, colorType: 'COLOR', color: 'Bronce', price: 42.00 },

    // Vidrios Catedral
    { commercialName: 'Catedral Clásico', family: 'CATEDRAL', thickness: 3, colorType: 'INCOLORO', price: 28.00 },
    { commercialName: 'Catedral Clásico', family: 'CATEDRAL', thickness: 4, colorType: 'INCOLORO', price: 35.50 },
    { commercialName: 'Catedral Verde', family: 'CATEDRAL', thickness: 3, colorType: 'COLOR', color: 'Verde', price: 38.00 },
    { commercialName: 'Catedral Azul', family: 'CATEDRAL', thickness: 3, colorType: 'COLOR', color: 'Azul', price: 38.00 },

    // Vidrios Templados
    { commercialName: 'Templado Incoloro', family: 'TEMPLADO', thickness: 6, colorType: 'INCOLORO', price: 85.00 },
    { commercialName: 'Templado Incoloro', family: 'TEMPLADO', thickness: 8, colorType: 'INCOLORO', price: 105.00 },
    { commercialName: 'Templado Incoloro', family: 'TEMPLADO', thickness: 10, colorType: 'INCOLORO', price: 125.00 },
    { commercialName: 'Templado Verde', family: 'TEMPLADO', thickness: 6, colorType: 'COLOR', color: 'Verde', price: 95.00 },

    // Espejos
    { commercialName: 'Espejo Plata', family: 'ESPEJO', thickness: 3, colorType: 'INCOLORO', price: 55.00 },
    { commercialName: 'Espejo Plata', family: 'ESPEJO', thickness: 4, colorType: 'INCOLORO', price: 68.00 },
    { commercialName: 'Espejo Bronce', family: 'ESPEJO', thickness: 4, colorType: 'COLOR', color: 'Bronce', price: 78.00 },
    { commercialName: 'Espejo Gris', family: 'ESPEJO', thickness: 4, colorType: 'COLOR', color: 'Gris', price: 78.00 },
  ]

  // Obtener IDs de colores para mapear
  const colorMap = await prisma.color.findMany()
  const colorIdMap = Object.fromEntries(
    colorMap.map(color => [color.name, color.id])
  )

  console.log('🪟 Creating glass pricing data...')
  for (const company of companies) {
    console.log(`  📋 Adding glasses for company: ${company.name}`)
    
    for (const glassData of glassesData) {
      const colorId = glassData.color ? colorIdMap[glassData.color] : null
      
      await prisma.pricingGlass.upsert({
        where: {
          companyId_commercialName_family_thicknessMM_validFrom: {
            companyId: company.id,
            commercialName: glassData.commercialName,
            family: glassData.family as any,
            thicknessMM: glassData.thickness,
            validFrom: new Date()
          }
        },
        update: {},
        create: {
          companyId: company.id,
          commercialName: glassData.commercialName,
          family: glassData.family as any,
          thicknessMM: glassData.thickness,
          colorType: glassData.colorType as any,
          colorId: colorId,
          price: glassData.price,
          isActive: true
        }
      })
    }
  }

  console.log('✅ Glass data seeding completed!')
}

async function main() {
  try {
    await seedGlassData()
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute main function
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
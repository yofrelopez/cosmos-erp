import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedGlassData() {
  console.log('🌱 Seeding glass and molding data...')

  try {
    // 1. Seed Colors (global catalog)
    console.log('📋 Creating colors...')
    const colors = [
      'Transparente', 'Verde', 'Azul', 'Gris', 'Bronce', 
      'Negro', 'Dorado', 'Plata', 'Café', 'Rojo'
    ]

    for (const colorName of colors) {
      await prisma.color.upsert({
        where: { name: colorName },
        update: {},
        create: { name: colorName }
      })
    }

    // 2. Seed Textures (global catalog)
    console.log('🏗️ Creating textures...')
    const textures = [
      'Liso', 'Cuadriculado', 'Llovizna', 'Garatachi', 
      'Flora', 'Marihuana', 'Ramas'
    ]

    for (const textureName of textures) {
      await prisma.texture.upsert({
        where: { name: textureName },
        update: {},
        create: { name: textureName }
      })
    }

    // 3. Get first available company
    console.log('🏢 Getting company...')
    let company = await prisma.company.findFirst({
      where: { status: 'ACTIVE' }
    })

    if (!company) {
      throw new Error('No active company found. Please create a company first.')
    }

    const companyId = company.id
    console.log(`📍 Using company: ${company.name} (ID: ${companyId})`)

    // 4. Create thickness entries if they don't exist
    console.log('📏 Creating thickness entries...')
    const thicknesses = [
      { name: '15mm' },
      { name: '20mm' }, 
      { name: '25mm' }
    ]

    for (const thickness of thicknesses) {
      await prisma.pricingThickness.upsert({
        where: { 
          companyId_name: { 
            companyId, 
            name: thickness.name 
          } 
        },
        update: {},
        create: {
          companyId,
          name: thickness.name
        }
      })
    }

    // 5. Get color IDs for reference
    const colorRefs = await prisma.color.findMany()
    const getColorId = (name: string) => colorRefs.find(c => c.name === name)?.id

    // 6. Seed Glass Prices
    console.log('🪟 Creating glass prices...')

    const glassData = [
      // PLANO 2mm (for frames)
      { name: 'Cristal Plano 2mm', family: 'PLANO', thickness: 2.00, colorType: 'INCOLORO', price: 8.50 },
      { name: 'Cristal Verde 2mm', family: 'PLANO', thickness: 2.00, colorType: 'COLOR', colorId: getColorId('Verde'), price: 9.80 },
      { name: 'Cristal Azul 2mm', family: 'PLANO', thickness: 2.00, colorType: 'COLOR', colorId: getColorId('Azul'), price: 9.80 },
      { name: 'Cristal Gris 2mm', family: 'PLANO', thickness: 2.00, colorType: 'COLOR', colorId: getColorId('Gris'), price: 9.80 },

      // PLANO other thicknesses
      { name: 'Cristal Plano 3mm', family: 'PLANO', thickness: 3.00, colorType: 'INCOLORO', price: 10.50 },
      { name: 'Cristal Verde 3mm', family: 'PLANO', thickness: 3.00, colorType: 'COLOR', colorId: getColorId('Verde'), price: 12.20 },
      { name: 'Cristal Plano 4mm', family: 'PLANO', thickness: 4.00, colorType: 'INCOLORO', price: 12.80 },
      { name: 'Cristal Verde 4mm', family: 'PLANO', thickness: 4.00, colorType: 'COLOR', colorId: getColorId('Verde'), price: 14.50 },
      { name: 'Cristal Plano 5mm', family: 'PLANO', thickness: 5.00, colorType: 'INCOLORO', price: 15.20 },
      { name: 'Cristal Plano 6mm', family: 'PLANO', thickness: 6.00, colorType: 'INCOLORO', price: 18.50 },

      // CATEDRAL 2mm (for frames)
      { name: 'Catedral Llovizna 2mm', family: 'CATEDRAL', thickness: 2.00, colorType: 'INCOLORO', price: 9.50 },
      { name: 'Catedral Cuadriculado 2mm', family: 'CATEDRAL', thickness: 2.00, colorType: 'INCOLORO', price: 9.50 },
      { name: 'Catedral Flora 2mm', family: 'CATEDRAL', thickness: 2.00, colorType: 'INCOLORO', price: 10.20 },

      // CATEDRAL other thicknesses
      { name: 'Catedral Llovizna 3mm', family: 'CATEDRAL', thickness: 3.00, colorType: 'INCOLORO', price: 11.80 },
      { name: 'Catedral Flora 3mm', family: 'CATEDRAL', thickness: 3.00, colorType: 'INCOLORO', price: 12.50 },
      { name: 'Catedral Llovizna 4mm', family: 'CATEDRAL', thickness: 4.00, colorType: 'INCOLORO', price: 14.20 },
      { name: 'Catedral Flora 4mm', family: 'CATEDRAL', thickness: 4.00, colorType: 'INCOLORO', price: 15.80 },
      { name: 'Catedral Llovizna 5mm', family: 'CATEDRAL', thickness: 5.00, colorType: 'INCOLORO', price: 16.50 },
      { name: 'Catedral Llovizna 6mm', family: 'CATEDRAL', thickness: 6.00, colorType: 'INCOLORO', price: 19.80 },

      // TEMPLADO
      { name: 'Templado Incoloro 4mm', family: 'TEMPLADO', thickness: 4.00, colorType: 'INCOLORO', price: 25.80 },
      { name: 'Templado Verde 4mm', family: 'TEMPLADO', thickness: 4.00, colorType: 'COLOR', colorId: getColorId('Verde'), price: 28.50 },
      { name: 'Templado Incoloro 5mm', family: 'TEMPLADO', thickness: 5.00, colorType: 'INCOLORO', price: 28.20 },
      { name: 'Templado Incoloro 6mm', family: 'TEMPLADO', thickness: 6.00, colorType: 'INCOLORO', price: 32.50 },
      { name: 'Templado Incoloro 8mm', family: 'TEMPLADO', thickness: 8.00, colorType: 'INCOLORO', price: 42.80 },
      { name: 'Templado Incoloro 10mm', family: 'TEMPLADO', thickness: 10.00, colorType: 'INCOLORO', price: 55.20 },

      // ESPEJOS
      { name: 'Espejo Plata 3mm', family: 'ESPEJO', thickness: 3.00, colorType: 'REFLEJANTE', colorId: getColorId('Plata'), price: 15.50 },
      { name: 'Espejo Bronce 3mm', family: 'ESPEJO', thickness: 3.00, colorType: 'REFLEJANTE', colorId: getColorId('Bronce'), price: 16.80 },
      { name: 'Espejo Plata 4mm', family: 'ESPEJO', thickness: 4.00, colorType: 'REFLEJANTE', colorId: getColorId('Plata'), price: 18.20 },
      { name: 'Espejo Bronce 4mm', family: 'ESPEJO', thickness: 4.00, colorType: 'REFLEJANTE', colorId: getColorId('Bronce'), price: 19.80 },
      { name: 'Espejo Plata 5mm', family: 'ESPEJO', thickness: 5.00, colorType: 'REFLEJANTE', colorId: getColorId('Plata'), price: 22.50 },
      { name: 'Espejo Plata 6mm', family: 'ESPEJO', thickness: 6.00, colorType: 'REFLEJANTE', colorId: getColorId('Plata'), price: 26.50 }
    ]

    for (const glass of glassData) {
      await prisma.pricingGlass.upsert({
        where: {
          companyId_commercialName_family_thicknessMM_validFrom: {
            companyId,
            commercialName: glass.name,
            family: glass.family as any,
            thicknessMM: glass.thickness,
            validFrom: new Date('2025-01-01') // Fixed date for uniqueness
          }
        },
        update: {
          price: glass.price,
          isActive: true
        },
        create: {
          companyId,
          commercialName: glass.name,
          family: glass.family as any,
          thicknessMM: glass.thickness,
          colorType: glass.colorType as any,
          colorId: glass.colorId || null,
          price: glass.price,
          validFrom: new Date('2025-01-01'),
          isActive: true
        }
      })
    }

    // 7. Seed Molding Data (if thickness entries exist)
    console.log('🔲 Creating molding prices...')
    const thicknessEntries = await prisma.pricingThickness.findMany({
      where: { companyId }
    })

    if (thicknessEntries.length > 0) {
      const moldingData = [
        // SIMPLE moldings
        { name: 'Moldura Simple Básica', quality: 'SIMPLE', thicknessId: thicknessEntries[0].id, price: 2.50 },
        { name: 'Moldura Simple Económica', quality: 'SIMPLE', thicknessId: thicknessEntries[0].id, price: 3.20 },
        { name: 'Moldura Simple Plus', quality: 'SIMPLE', thicknessId: thicknessEntries[1]?.id || thicknessEntries[0].id, price: 4.80 },

        // FINA moldings
        { name: 'Moldura Fina Clásica', quality: 'FINA', thicknessId: thicknessEntries[1]?.id || thicknessEntries[0].id, price: 8.50 },
        { name: 'Moldura Fina Elegante', quality: 'FINA', thicknessId: thicknessEntries[2]?.id || thicknessEntries[0].id, price: 12.20 },
        { name: 'Moldura Fina Premium', quality: 'FINA', thicknessId: thicknessEntries[2]?.id || thicknessEntries[0].id, price: 15.80 },

        // BASTIDOR moldings
        { name: 'Bastidor Simple', quality: 'BASTIDOR', thicknessId: thicknessEntries[0].id, price: 6.20 },
        { name: 'Bastidor Reforzado', quality: 'BASTIDOR', thicknessId: thicknessEntries[1]?.id || thicknessEntries[0].id, price: 8.80 },
        { name: 'Bastidor Premium', quality: 'BASTIDOR', thicknessId: thicknessEntries[2]?.id || thicknessEntries[0].id, price: 12.50 }
      ]

      for (const molding of moldingData) {
        await prisma.pricingMolding.upsert({
          where: {
            companyId_name_thicknessId_validFrom: {
              companyId,
              name: molding.name,
              thicknessId: molding.thicknessId,
              validFrom: new Date('2025-01-01')
            }
          },
          update: {
            pricePerM: molding.price,
            isActive: true
          },
          create: {
            companyId,
            name: molding.name,
            quality: molding.quality as any,
            thicknessId: molding.thicknessId,
            pricePerM: molding.price,
            validFrom: new Date('2025-01-01'),
            isActive: true
          }
        })
      }
    }

    console.log('✅ Glass and molding data seeded successfully!')
    console.log(`📊 Company ID used: ${companyId} (${company.name})`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  }
}

async function main() {
  await seedGlassData()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
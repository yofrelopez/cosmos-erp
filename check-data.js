import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const thicknessCount = await prisma.pricingThickness.count();
    const moldingCount = await prisma.pricingMolding.count();
    const textureCount = await prisma.moldingTexture.count();
    const colorCount = await prisma.moldingColor.count();
    
    console.log('📊 Resumen de datos creados:');
    console.log(`   Espesores: ${thicknessCount}`);
    console.log(`   Molduras: ${moldingCount}`);
    console.log(`   Texturas: ${textureCount}`);
    console.log(`   Colores: ${colorCount}`);
    
    console.log('\n📋 Espesores creados:');
    const thickness = await prisma.pricingThickness.findMany({
      select: { id: true, name: true }
    });
    thickness.forEach((t, i) => console.log(`   ${i+1}. ${t.name}`));
    
    console.log('\n🖼️ Molduras creadas:');
    const moldings = await prisma.pricingMolding.findMany({
      include: { thickness: true }
    });
    moldings.forEach((m, i) => console.log(`   ${i+1}. ${m.name} (${m.quality}) - $${m.pricePerM}/m - ${m.thickness.name}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
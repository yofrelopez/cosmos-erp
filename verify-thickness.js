import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkThicknessStructure() {
  try {
    console.log('🔍 Verificando estructura simplificada de espesores...');
    
    // Obtener un espesor de ejemplo para ver la estructura
    const sampleThickness = await prisma.pricingThickness.findFirst();
    
    if (sampleThickness) {
      console.log('✅ Estructura actual de PricingThickness:');
      console.log('   Campos disponibles:', Object.keys(sampleThickness));
      console.log('   Ejemplo:', sampleThickness);
    } else {
      console.log('❌ No hay espesores en la base de datos');
    }
    
    // Verificar que solo tiene los campos esperados: id, companyId, name
    const expectedFields = ['id', 'companyId', 'name'];
    const actualFields = Object.keys(sampleThickness || {});
    
    const hasOnlyExpectedFields = expectedFields.every(field => actualFields.includes(field)) 
      && actualFields.length === expectedFields.length;
    
    if (hasOnlyExpectedFields) {
      console.log('✅ La tabla espesores tiene exactamente los campos requeridos: id, companyId, name');
    } else {
      console.log('⚠️ La tabla espesores tiene campos adicionales o faltantes');
      console.log('   Esperados:', expectedFields);
      console.log('   Actuales:', actualFields);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkThicknessStructure();
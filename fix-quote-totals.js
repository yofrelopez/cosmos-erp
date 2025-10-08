// Script para recalcular y actualizar todos los totales de cotizaciones
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixQuoteTotals() {
  try {
    console.log('🔧 Iniciando corrección de totales de cotizaciones...\n');
    
    // Obtener todas las cotizaciones con sus items
    const quotes = await prisma.quote.findMany({
      include: {
        items: true
      }
    });
    
    console.log(`📊 Encontradas ${quotes.length} cotizaciones para revisar\n`);
    
    let updated = 0;
    
    for (const quote of quotes) {
      // Calcular el total correcto
      const correctTotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
      
      if (quote.total !== correctTotal) {
        console.log(`🔄 Actualizando cotización ${quote.code}:`);
        console.log(`   Total anterior: ${quote.total}`);
        console.log(`   Total correcto: ${correctTotal}`);
        
        // Actualizar el total en la base de datos
        await prisma.quote.update({
          where: { id: quote.id },
          data: { total: correctTotal }
        });
        
        updated++;
        console.log(`   ✅ Actualizada\n`);
      } else {
        console.log(`✅ Cotización ${quote.code} ya tiene el total correcto\n`);
      }
    }
    
    console.log(`🎉 Proceso completado. ${updated} cotizaciones fueron actualizadas.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuoteTotals();
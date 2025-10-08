// Debug script para verificar los datos de las cotizaciones
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugQuotes() {
  try {
    console.log('🔍 Verificando cotizaciones...\n');
    
    // Obtener todas las cotizaciones con sus items
    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total de cotizaciones encontradas: ${quotes.length}\n`);
    
    quotes.forEach((quote, index) => {
      console.log(`--- Cotización ${index + 1} ---`);
      console.log(`ID: ${quote.id}`);
      console.log(`Código: ${quote.code}`);
      console.log(`Cliente: ${quote.client?.fullName || 'Sin cliente'}`);
      console.log(`Total almacenado: ${quote.total}`);
      console.log(`Items (${quote.items.length}):`);
      
      let calculatedTotal = 0;
      quote.items.forEach(item => {
        console.log(`  - ${item.description}: ${item.quantity} x ${item.unitPrice} = ${item.subtotal}`);
        calculatedTotal += item.subtotal;
      });
      
      console.log(`Total calculado: ${calculatedTotal}`);
      console.log(`¿Coincide?: ${quote.total === calculatedTotal ? '✅' : '❌'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugQuotes();
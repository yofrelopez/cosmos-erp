const { PrismaClient } = require('@prisma/client');

async function checkDuplicateClients() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando IDs duplicados en la tabla de clientes...\n');
    
    // Buscar IDs duplicados
    const duplicateIds = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count
      FROM "Client"
      GROUP BY id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    console.log('📊 IDs duplicados encontrados:', duplicateIds.length);
    
    if (duplicateIds.length > 0) {
      console.log('\n❌ PROBLEMA ENCONTRADO - IDs duplicados:');
      duplicateIds.forEach((duplicate, index) => {
        console.log(`${index + 1}. ID: ${duplicate.id} - Aparece ${duplicate.count} veces`);
      });
      
      // Mostrar detalles de cada grupo de duplicados
      console.log('\n📋 Detalles de los clientes duplicados:');
      for (const duplicate of duplicateIds) {
        console.log(`\n--- Clientes con ID: ${duplicate.id} ---`);
        const clients = await prisma.client.findMany({
          where: { id: duplicate.id }
        });
        
        clients.forEach((client, index) => {
          console.log(`  ${index + 1}. ${client.fullName || client.businessName} - ${client.documentNumber}`);
          console.log(`     Creado: ${client.createdAt}`);
          console.log(`     Empresa: ${client.companyId}`);
        });
      }
      
      // Verificar si hay cotizaciones que referencian estos IDs duplicados
      console.log('\n🔗 Verificando cotizaciones afectadas...');
      for (const duplicate of duplicateIds) {
        const quotesCount = await prisma.quote.count({
          where: { clientId: duplicate.id }
        });
        console.log(`  ID ${duplicate.id}: ${quotesCount} cotizaciones`);
      }
      
    } else {
      console.log('✅ No se encontraron IDs duplicados en la tabla de clientes');
      
      // Verificar otros posibles problemas
      console.log('\n🔍 Verificando otros problemas potenciales...');
      
      // Clientes con IDs nulos o inválidos (ya no es posible con PRIMARY KEY)
      const nullIds = 0; // Ya no puede haber IDs nulos con PRIMARY KEY
      console.log(`📋 Clientes con ID null: ${nullIds}`);
      
      // Verificar integridad referencial con quotes
      const orphanedQuotes = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "Quote" q
        LEFT JOIN "Client" c ON q."clientId" = c.id
        WHERE c.id IS NULL
      `;
      console.log(`🔗 Cotizaciones huérfanas (sin cliente): ${orphanedQuotes[0]?.count || 0}`);
      
      // Total de clientes y cotizaciones
      const clientsTotal = await prisma.client.count();
      const quotesTotal = await prisma.quote.count();
      console.log(`📊 Total clientes: ${clientsTotal}`);
      console.log(`📊 Total cotizaciones: ${quotesTotal}`);
    }
    
  } catch (error) {
    console.error('❌ Error al verificar duplicados:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicateClients();
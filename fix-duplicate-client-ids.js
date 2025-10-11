const { PrismaClient } = require('@prisma/client');

async function fixDuplicateClientIds() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Iniciando proceso de reparación de IDs duplicados...\n');
    
    // 1. Identificar IDs duplicados
    const duplicateIds = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count
      FROM "Client"
      GROUP BY id
      HAVING COUNT(*) > 1
      ORDER BY id
    `;
    
    if (duplicateIds.length === 0) {
      console.log('✅ No se encontraron IDs duplicados');
      return;
    }
    
    console.log(`📊 Encontrados ${duplicateIds.length} IDs duplicados`);
    
    // 2. Obtener el próximo ID disponible
    const maxId = await prisma.$queryRaw`
      SELECT COALESCE(MAX(id), 0) as max_id FROM "Client"
    `;
    let nextAvailableId = maxId[0].max_id + 1;
    
    console.log(`🆔 Próximo ID disponible: ${nextAvailableId}\n`);
    
    // 3. Procesar cada grupo de IDs duplicados
    for (const duplicate of duplicateIds) {
      console.log(`--- Procesando ID duplicado: ${duplicate.id} ---`);
      
      // Obtener todos los clientes con este ID
      const clients = await prisma.client.findMany({
        where: { id: duplicate.id },
        orderBy: { createdAt: 'asc' } // El más antiguo mantiene el ID original
      });
      
      console.log(`📋 Encontrados ${clients.length} clientes con ID ${duplicate.id}`);
      
      // El primer cliente (más antiguo) mantiene su ID
      const [keepOriginal, ...duplicates] = clients;
      console.log(`✅ Manteniendo ID ${duplicate.id} para: ${keepOriginal.fullName || keepOriginal.businessName}`);
      
      // Los demás necesitan nuevos IDs
      for (const [index, client] of duplicates.entries()) {
        const oldId = client.id;
        const newId = nextAvailableId++;
        
        console.log(`🔄 Cambiando ID de "${client.fullName || client.businessName}" de ${oldId} a ${newId}`);
        
        // Iniciar transacción para garantizar consistencia
        await prisma.$transaction(async (tx) => {
          // 1. Actualizar las cotizaciones que referencian este cliente
          const quotesUpdated = await tx.quote.updateMany({
            where: { 
              clientId: oldId,
              // Solo actualizar las cotizaciones que pertenecen a este cliente específico
              // Usamos una subconsulta para ser más específicos
            },
            data: { clientId: newId }
          });
          
          // Verificar qué cotizaciones actualizar específicamente
          const quotesToUpdate = await tx.quote.findMany({
            where: { clientId: oldId },
            select: { id: true, code: true, createdAt: true }
          });
          
          // Determinar qué cotizaciones pertenecen a qué cliente basándose en fechas
          const clientQuotes = quotesToUpdate.filter(quote => {
            // Si la cotización se creó después de este cliente, probablemente le pertenece
            return quote.createdAt >= client.createdAt;
          });
          
          // Actualizar solo las cotizaciones que corresponden a este cliente
          for (const quote of clientQuotes) {
            await tx.quote.update({
              where: { id: quote.id },
              data: { clientId: newId }
            });
          }
          
          console.log(`   📝 Actualizadas ${clientQuotes.length} cotizaciones`);
          
          // 2. Actualizar el ID del cliente
          await tx.client.update({
            where: { 
              id: oldId,
              documentNumber: client.documentNumber // Para ser específicos
            },
            data: { id: newId }
          });
          
          // 3. Actualizar los contratos si existen
          const contractsUpdated = await tx.contract.updateMany({
            where: { clientId: oldId },
            data: { clientId: newId }
          });
          
          console.log(`   📄 Actualizados ${contractsUpdated.count} contratos`);
        });
        
        console.log(`✅ Cliente actualizado correctamente\n`);
      }
    }
    
    // 4. Actualizar la secuencia de autoincrement
    console.log('🔄 Actualizando secuencia de autoincrement...');
    await prisma.$executeRaw`
      SELECT setval(pg_get_serial_sequence('"Client"', 'id'), ${nextAvailableId});
    `;
    
    // 5. Verificación final
    console.log('\n🔍 Verificación final...');
    const finalDuplicates = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count
      FROM "Client"
      GROUP BY id
      HAVING COUNT(*) > 1
    `;
    
    if (finalDuplicates.length === 0) {
      console.log('✅ ¡Reparación completada exitosamente! No quedan IDs duplicados');
      
      // Mostrar estadísticas finales
      const clientsTotal = await prisma.client.count();
      const quotesTotal = await prisma.quote.count();
      console.log(`📊 Total clientes: ${clientsTotal}`);
      console.log(`📊 Total cotizaciones: ${quotesTotal}`);
      
      // Verificar integridad referencial
      const orphanedQuotes = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "Quote" q
        LEFT JOIN "Client" c ON q."clientId" = c.id
        WHERE c.id IS NULL
      `;
      console.log(`🔗 Cotizaciones huérfanas: ${orphanedQuotes[0]?.count || 0}`);
      
    } else {
      console.log('❌ Aún existen IDs duplicados:', finalDuplicates.length);
    }
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    console.error('Stack:', error.stack);
    console.log('\n⚠️  Se recomienda revisar la base de datos manualmente');
  } finally {
    await prisma.$disconnect();
  }
}

// Función para hacer backup antes de la reparación
async function createBackup() {
  console.log('💾 Creando backup de seguridad...');
  const prisma = new PrismaClient();
  
  try {
    const clients = await prisma.client.findMany();
    const quotes = await prisma.quote.findMany({
      select: { id: true, clientId: true, code: true }
    });
    
    const backup = {
      timestamp: new Date().toISOString(),
      clients: clients,
      quotes: quotes
    };
    
    const fs = require('fs');
    const backupFile = `backup-before-fix-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup creado: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Error creando backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 REPARACIÓN DE IDS DUPLICADOS EN CLIENTES\n');
  console.log('⚠️  ADVERTENCIA: Este proceso modificará la base de datos');
  console.log('📋 Se recomienda hacer un backup antes de continuar\n');
  
  try {
    // Crear backup
    const backupFile = await createBackup();
    console.log(`💾 Backup guardado como: ${backupFile}\n`);
    
    // Ejecutar reparación
    await fixDuplicateClientIds();
    
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
  }
}

main();
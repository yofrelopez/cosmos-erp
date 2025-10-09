const { Client } = require('pg');

// Probar conexión local
const localClient = new Client({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos',
  connectionTimeoutMillis: 5000
});

async function testLocalConnection() {
  try {
    console.log('🔄 Conectando a PostgreSQL local...');
    await localClient.connect();
    console.log('✅ ¡Conexión local exitosa!');
    
    // Listar tablas
    const tables = await localClient.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Tablas encontradas: ${tables.rows.length}`);
    console.log('┌─────────────────────────────┬──────────┐');
    console.log('│ Tabla                       │ Columnas │');
    console.log('├─────────────────────────────┼──────────┤');
    
    for (const table of tables.rows) {
      const tableName = table.table_name.padEnd(27);
      const columnCount = table.column_count.toString().padStart(8);
      console.log(`│ ${tableName} │ ${columnCount} │`);
    }
    console.log('└─────────────────────────────┴──────────┘');
    
    // Contar registros en tablas principales
    const mainTables = ['User', 'Company', 'Quote', 'Client'];
    console.log('\n📈 Datos en tablas principales:');
    
    for (const tableName of mainTables) {
      try {
        const count = await localClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
        console.log(`   ${tableName}: ${count.rows[0].count} registros`);
      } catch (error) {
        console.log(`   ${tableName}: Tabla no existe o error`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error de conexión local:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Soluciones posibles:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose');
      console.log('   2. Confirmar puerto 5432');
      console.log('   3. Verificar credenciales: postgres/admin123');
    }
  } finally {
    await localClient.end();
  }
}

testLocalConnection();
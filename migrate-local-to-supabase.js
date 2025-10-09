// Script para exportar datos de PostgreSQL local a Supabase
const { Client } = require('pg');
const fs = require('fs');

// Configuración de conexiones
const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function exportData() {
  const localClient = new Client(LOCAL_DB);
  const supabaseClient = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a base de datos local...');
    await localClient.connect();
    
    console.log('🔄 Conectando a Supabase...');
    await supabaseClient.connect();
    
    // Obtener lista de tablas
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:', tablesResult.rows.length);
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n📦 Procesando tabla: ${tableName}`);
      
      // Obtener datos de la tabla
      const dataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
      console.log(`   📊 Registros: ${dataResult.rows.length}`);
      
      if (dataResult.rows.length > 0) {
        // Limpiar tabla en Supabase
        try {
          await supabaseClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
          console.log(`   🧹 Tabla limpiada en Supabase`);
        } catch (error) {
          console.log(`   ⚠️  Tabla ${tableName} no existe en Supabase o error: ${error.message}`);
          // Continuar con la siguiente tabla
          continue;
        }
        
        // Insertar datos
        const columns = Object.keys(dataResult.rows[0]);
        const values = dataResult.rows.map(row => 
          '(' + columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return val;
          }).join(', ') + ')'
        ).join(', ');
        
        const insertQuery = `
          INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) 
          VALUES ${values}
        `;
        
        await supabaseClient.query(insertQuery);
        console.log(`   ✅ ${dataResult.rows.length} registros insertados`);
      }
    }
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  exportData();
}

module.exports = { exportData };
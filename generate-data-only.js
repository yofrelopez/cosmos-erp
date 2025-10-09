const { Client } = require('pg');
const fs = require('fs').promises;

// Configuración de conexión local
const localConfig = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos',
  connectionTimeoutMillis: 5000
};

async function generateDataOnlySQL() {
  const localClient = new Client(localConfig);

  try {
    console.log('🔌 Conectando a base de datos local...');
    await localClient.connect();
    console.log('✅ Conexión establecida');

    let sqlContent = `-- ============================================
-- SOLO DATOS PARA SUPABASE - ERP VD COSMOS
-- 
-- Este archivo contiene SOLO los datos (no estructura)
-- Las tablas ya deben existir en Supabase
-- ============================================

`;

    // Lista de tablas en orden correcto (respetando foreign keys)
    const tables = [
      'Company',
      'BankAccount', 
      'Branch',
      'Wallet',
      'Client',
      'colors',
      'textures',
      'molding_colors',
      'molding_textures', 
      'pricing_thickness',
      'pricing_glass',
      'pricing_molding',
      'Quote',
      'QuoteItem',
      'users',
      'Contract',
      'ContractItem',
      'Payment',
      'Observation',
      'accounts',
      'sessions',
      'verification_tokens',
      'pricing_accessory',
      'pricing_backing', 
      'pricing_frame_preset',
      'pricing_matboard'
    ];

    let totalRecords = 0;

    for (const tableName of tables) {
      try {
        // Verificar si la tabla existe y tiene datos
        const countResult = await localClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const recordCount = parseInt(countResult.rows[0].count);
        
        if (recordCount === 0) {
          sqlContent += `-- Tabla ${tableName}: Sin datos\n\n`;
          continue;
        }

        console.log(`📊 Procesando tabla: ${tableName} (${recordCount} registros)`);

        // Obtener estructura de columnas
        const columnsResult = await localClient.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public' 
          ORDER BY ordinal_position
        `, [tableName]);

        const columns = columnsResult.rows.map(row => row.column_name);

        // Obtener todos los datos
        const dataResult = await localClient.query(`SELECT * FROM "${tableName}" ORDER BY 1`);

        sqlContent += `-- ==========================================\n`;
        sqlContent += `-- Datos para tabla: ${tableName}\n`;
        sqlContent += `-- Registros: ${recordCount}\n`;
        sqlContent += `-- ==========================================\n\n`;

        // Limpiar tabla antes de insertar
        sqlContent += `TRUNCATE TABLE "${tableName}" CASCADE;\n`;

        // Generar INSERTs
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            if (typeof value === 'boolean') return value;
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            }
            return value;
          });

          const insertSQL = `INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          sqlContent += insertSQL;
        }

        sqlContent += '\n';
        totalRecords += recordCount;

      } catch (error) {
        console.log(`⚠️  Tabla "${tableName}": ${error.message}`);
        sqlContent += `-- Tabla ${tableName}: Error - ${error.message}\n\n`;
      }
    }

    sqlContent += `-- ============================================\n`;
    sqlContent += `-- COMPLETADO EXITOSAMENTE\n`;
    sqlContent += `-- Total de registros: ${totalRecords}\n`;
    sqlContent += `-- ============================================\n`;

    // Guardar archivo
    const filename = 'supabase-data-only.sql';
    await fs.writeFile(filename, sqlContent, 'utf8');
    
    console.log('\n🎉 ¡Archivo de datos generado exitosamente!');
    console.log(`📄 Archivo: ${filename}`);
    console.log(`📊 Tamaño: ${Math.round((Buffer.byteLength(sqlContent, 'utf8')) / 1024)}KB`);
    console.log(`🔢 Total registros: ${totalRecords}`);
    console.log('\n📝 Ahora puedes ejecutar este archivo en Supabase SQL Editor');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await localClient.end();
  }
}

generateDataOnlySQL().catch(console.error);
// Generar SQL limpio para subida manual a Supabase
const { Client } = require('pg');
const fs = require('fs');

const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

async function generateCleanSQL() {
  const client = new Client(LOCAL_DB);
  
  try {
    console.log('🔄 Conectando a base de datos local...');
    await client.connect();
    
    console.log('📋 Generando SQL limpio para Supabase...');
    
    let sqlContent = `-- ============================================
-- DATOS PARA SUPABASE - ERP VD COSMOS
-- Instrucciones:
-- 1. Ve a tu dashboard de Supabase
-- 2. Ir a SQL Editor  
-- 3. Pegar este contenido completo
-- 4. Ejecutar
-- ============================================

-- Deshabilitar checks temporalmente
SET session_replication_role = replica;

`;

    // Orden correcto de tablas (respetando foreign keys)
    const tablesOrder = [
      { name: 'Company', priority: 1 },
      { name: 'User', priority: 2 },
      { name: 'BankAccount', priority: 3 },
      { name: 'Branch', priority: 3 },
      { name: 'Wallet', priority: 3 },
      { name: 'Client', priority: 4 },
      { name: 'colors', priority: 5 },
      { name: 'textures', priority: 5 },
      { name: 'molding_colors', priority: 5 },
      { name: 'molding_textures', priority: 5 },
      { name: 'pricing_thickness', priority: 6 },
      { name: 'pricing_glass', priority: 6 },
      { name: 'pricing_molding', priority: 6 },
      { name: 'pricing_accessory', priority: 6 },
      { name: 'pricing_backing', priority: 6 },
      { name: 'pricing_frame_preset', priority: 6 },
      { name: 'pricing_matboard', priority: 6 },
      { name: 'Quote', priority: 7 },
      { name: 'QuoteItem', priority: 8 },
      { name: 'Contract', priority: 7 },
      { name: 'ContractItem', priority: 8 },
      { name: 'Payment', priority: 9 },
      { name: 'Observation', priority: 9 }
    ];
    
    // Obtener todas las tablas que existen
    const existingTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '%migrations%'
    `);
    
    const existingTables = existingTablesResult.rows.map(row => row.table_name);
    
    // Procesar tablas en orden de prioridad
    const allTables = [...tablesOrder, ...existingTables.filter(t => 
      !tablesOrder.some(ordered => ordered.name === t)
    ).map(t => ({ name: t, priority: 10 }))];
    
    allTables.sort((a, b) => a.priority - b.priority);
    
    let totalRecords = 0;
    
    for (const tableInfo of allTables) {
      const tableName = tableInfo.name;
      
      if (!existingTables.includes(tableName)) {
        continue;
      }
      
      console.log(`📦 Procesando: ${tableName}`);
      
      try {
        const dataResult = await client.query(`SELECT * FROM "${tableName}"`);
        
        if (dataResult.rows.length === 0) {
          sqlContent += `-- Tabla ${tableName}: Sin datos\n\n`;
          continue;
        }
        
        sqlContent += `-- ==========================================\n`;
        sqlContent += `-- Datos para tabla: ${tableName}\n`;
        sqlContent += `-- Registros: ${dataResult.rows.length}\n`;
        sqlContent += `-- ==========================================\n\n`;
        
        // Limpiar tabla antes de insertar
        sqlContent += `DELETE FROM "${tableName}";\n`;
        
        // Generar INSERTs individuales (más compatibles)
        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') {
              // Escapar comillas simples
              return `'${val.replace(/'/g, "''")}'`;
            }
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val.toString();
            if (typeof val === 'number') return val.toString();
            return `'${val}'`;
          });
          
          sqlContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          totalRecords++;
        }
        
        sqlContent += `\n`;
        console.log(`   ✅ ${dataResult.rows.length} registros preparados`);
        
      } catch (error) {
        console.log(`   ⚠️  Error en ${tableName}: ${error.message.substring(0, 60)}`);
        sqlContent += `-- ERROR en tabla ${tableName}: ${error.message}\n\n`;
      }
    }
    
    sqlContent += `-- Rehabilitar checks
SET session_replication_role = DEFAULT;

-- ============================================
-- COMPLETADO
-- Total de registros: ${totalRecords}
-- ============================================`;
    
    const filename = 'datos-corregidos-supabase.sql';
    fs.writeFileSync(filename, sqlContent, 'utf8');
    
    console.log(`\n🎉 ¡Archivo SQL generado exitosamente!`);
    console.log(`📄 Archivo: ${filename}`);
    console.log(`📊 Tamaño: ${Math.round(fs.statSync(filename).size / 1024)}KB`);
    console.log(`🔢 Total registros: ${totalRecords}`);
    
    console.log(`\n📋 PASOS PARA SUBIR A SUPABASE:`);
    console.log(`1. Ve a tu dashboard: https://supabase.com/dashboard`);
    console.log(`2. Selecciona tu proyecto: erp-vdcosmos`);
    console.log(`3. Ve a "SQL Editor" en la barra lateral`);
    console.log(`4. Abre el archivo: ${filename}`);
    console.log(`5. Copia TODO el contenido`);
    console.log(`6. Pégalo en el SQL Editor`);
    console.log(`7. Haz clic en "Run" o presiona Ctrl+Enter`);
    console.log(`8. ¡Listo! Todos tus datos estarán en Supabase`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

generateCleanSQL();
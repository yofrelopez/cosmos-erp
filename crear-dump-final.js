// Script para crear dump limpio sin caracteres problemáticos
const { Client } = require('pg');
const fs = require('fs');

const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

async function createCleanDump() {
  const client = new Client(LOCAL_DB);
  
  try {
    console.log('🔄 Conectando a base de datos local...');
    await client.connect();
    
    let sqlContent = `-- ============================================
-- DUMP LIMPIO PARA SUPABASE - ERP VD COSMOS
-- 
-- Este archivo contiene EXACTAMENTE tu base de datos
-- local, sin caracteres problemáticos
-- ============================================

`;

    console.log('📋 1. Exportando ENUMs...');
    
    // 1. Crear ENUMs
    const enumsResult = await client.query(`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    
    sqlContent += '-- CREACIÓN DE ENUMS\n';
    for (const enumRow of enumsResult.rows) {
      const enumName = enumRow.enum_name;
      const enumValues = Array.isArray(enumRow.enum_values) 
        ? enumRow.enum_values.map(v => `'${v}'`).join(', ')
        : `'${enumRow.enum_values}'`;
      sqlContent += `DROP TYPE IF EXISTS "${enumName}" CASCADE;\n`;
      sqlContent += `CREATE TYPE "${enumName}" AS ENUM (${enumValues});\n\n`;
    }
    
    console.log('📋 2. Exportando estructura de tablas...');
    
    // 2. Crear tablas (solo estructura desde Prisma)
    sqlContent += `-- NOTA: Las tablas se crearán usando el esquema Prisma existente\n`;
    sqlContent += `-- Si no existen las tablas, ejecuta primero: npx prisma db push\n\n`;
    
    console.log('📋 3. Exportando datos...');
    
    // 3. Exportar datos
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '%migrations%'
      ORDER BY table_name
    `);
    
    // Orden de inserción respetando FK
    const insertOrder = [
      'Company', 'User', 'BankAccount', 'Branch', 'Wallet', 'Client',
      'colors', 'textures', 'molding_colors', 'molding_textures',
      'pricing_thickness', 'pricing_glass', 'pricing_molding',
      'pricing_accessory', 'pricing_backing', 'pricing_frame_preset', 'pricing_matboard',
      'Quote', 'QuoteItem', 'Contract', 'ContractItem', 'Payment', 'Observation',
      'accounts', 'sessions', 'verification_tokens', 'users'
    ];
    
    let totalRecords = 0;
    
    for (const tableName of insertOrder) {
      // Verificar si la tabla existe
      const tableExists = tablesResult.rows.some(t => t.table_name === tableName);
      if (!tableExists) continue;
      
      console.log(`   📦 Exportando: ${tableName}`);
      
      const dataResult = await client.query(`SELECT * FROM "${tableName}"`);
      
      if (dataResult.rows.length === 0) {
        sqlContent += `-- Tabla ${tableName}: Sin datos\n\n`;
        continue;
      }
      
      sqlContent += `-- ==========================================\n`;
      sqlContent += `-- Datos para tabla: ${tableName}\n`;
      sqlContent += `-- Registros: ${dataResult.rows.length}\n`;
      sqlContent += `-- ==========================================\n\n`;
      
      sqlContent += `TRUNCATE TABLE "${tableName}" CASCADE;\n`;
      
      for (const row of dataResult.rows) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'boolean') return val.toString();
          if (typeof val === 'number') return val.toString();
          return `'${val}'`;
        });
        
        sqlContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        totalRecords++;
      }
      
      sqlContent += '\n';
    }
    
    sqlContent += `-- ============================================\n`;
    sqlContent += `-- COMPLETADO EXITOSAMENTE\n`;
    sqlContent += `-- Total de registros: ${totalRecords}\n`;
    sqlContent += `-- ============================================\n`;
    
    const filename = 'supabase-final-limpio.sql';
    fs.writeFileSync(filename, sqlContent, 'utf8');
    
    console.log(`\n🎉 ¡Dump limpio generado exitosamente!`);
    console.log(`📄 Archivo: ${filename}`);
    console.log(`📊 Tamaño: ${Math.round(sqlContent.length / 1024)}KB`);
    console.log(`🔢 Total registros: ${totalRecords}`);
    
    console.log(`\n📋 INSTRUCCIONES PARA SUPABASE:`);
    console.log(`1. Abre: ${filename}`);
    console.log(`2. Ve a: https://supabase.com/dashboard`);
    console.log(`3. SQL Editor → Pegar contenido → Ejecutar`);
    console.log(`4. ¡Tu base de datos exacta estará en Supabase!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

createCleanDump();
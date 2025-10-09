// Script optimizado para clonar base de datos local a Supabase
// Usa consultas SQL directas para máxima eficiencia
const { Client } = require('pg');
const fs = require('fs');

const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function cloneDatabase() {
  const localClient = new Client(LOCAL_DB);
  const supabaseClient = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a ambas bases de datos...');
    await localClient.connect();
    await supabaseClient.connect();
    
    // 1. Primero aplicaremos Prisma migrations para crear el schema
    console.log('📋 1. Schema será creado via Prisma migrations...');
    
    // 2. Obtener ENUMS
    console.log('📋 2. Exportando enums...');
    const enumsResult = await localClient.query(`
      SELECT 
        'CREATE TYPE ' || t.typname || ' AS ENUM (' ||
        string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) ||
        ');' as create_enum
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    
    // 3. Crear archivo SQL completo
    let sqlScript = '-- CLONACION COMPLETA DE BASE DE datos LOCAL A SUPABASE\n\n';
    
    // Agregar enums
    sqlScript += '-- ENUMS\n';
    for (const enumRow of enumsResult.rows) {
      sqlScript += enumRow.create_enum + '\n';
    }
    
    // Las tablas se crearán con Prisma
    sqlScript += '\n-- IMPORTANTE: Ejecutar primero "npx prisma migrate deploy"\n';
    
    // 4. Obtener datos de todas las tablas
    console.log('📋 3. Exportando datos...');
    const tablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name
    `);
    
    sqlScript += '\n-- DATOS\n';
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`   📦 Exportando datos de: ${tableName}`);
      
      const dataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
      
      if (dataResult.rows.length > 0) {
        const columns = Object.keys(dataResult.rows[0]);
        sqlScript += `\n-- Datos para tabla ${tableName}\n`;
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val.toString();
            return val;
          }).join(', ');
          
          sqlScript += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values});\n`;
        }
      }
    }
    
    // 5. Guardar archivo SQL
    const filename = 'clone-database.sql';
    fs.writeFileSync(filename, sqlScript);
    console.log(`✅ Archivo SQL generado: ${filename}`);
    console.log(`📊 Tamaño del archivo: ${Math.round(fs.statSync(filename).size / 1024)}KB`);
    
    console.log('\n🎉 ¡Clonación preparada!');
    console.log('📋 Siguiente paso: Ejecutar el SQL en Supabase');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

cloneDatabase();
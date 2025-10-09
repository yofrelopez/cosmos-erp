// Script para limpiar completamente Supabase
const { Client } = require('pg');

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function cleanSupabase() {
  const client = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a Supabase...');
    await client.connect();
    
    // Deshabilitar foreign key checks temporalmente
    await client.query('SET session_replication_role = replica;');
    
    // Obtener todas las tablas del schema public
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
      ORDER BY table_name
    `);
    
    console.log(`📋 Encontradas ${tablesResult.rows.length} tablas para eliminar`);
    
    // Eliminar todas las tablas
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`🗑️  Eliminando tabla: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }
    
    // Obtener todos los enums personalizados
    const enumsResult = await client.query(`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    
    console.log(`📋 Encontrados ${enumsResult.rows.length} enums para eliminar`);
    
    // Eliminar todos los enums
    for (const enumRow of enumsResult.rows) {
      const enumName = enumRow.enum_name;
      console.log(`🗑️  Eliminando enum: ${enumName}`);
      await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
    }
    
    // Rehabilitar foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log('🎉 ¡Supabase limpiado completamente!');
    console.log('✅ Todas las tablas eliminadas');
    console.log('✅ Todos los enums eliminados');
    console.log('✅ Listo para aplicar migraciones desde cero');
    
  } catch (error) {
    console.error('❌ Error limpiando Supabase:', error);
  } finally {
    await client.end();
  }
}

cleanSupabase();
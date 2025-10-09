// Script final optimizado para clonar base de datos
// Usa transacciones y mejor manejo de errores
const { Client } = require('pg');

const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function smartClone() {
  const localClient = new Client(LOCAL_DB);
  const supabaseClient = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a ambas bases de datos...');
    await localClient.connect();
    await supabaseClient.connect();
    
    // 1. CREAR TODAS LAS TABLAS PRIMERO (estructura sin datos)
    console.log('📋 1. Creando estructura de tablas...');
    
    // Obtener CREATE TABLE statements completos
    const createTablesQuery = `
      SELECT 
        'CREATE TABLE IF NOT EXISTS ' || quote_ident(table_name) || ' (' ||
        string_agg(
          quote_ident(column_name) || ' ' || 
          CASE 
            WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
            WHEN data_type = 'character' THEN 'char(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' THEN 'numeric(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN data_type = 'USER-DEFINED' THEN udt_name
            ELSE data_type
          END ||
          CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
          CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END
          , ', ' ORDER BY ordinal_position
        ) || ');' as create_statement,
        table_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE '%migrations%'
      GROUP BY table_name
      ORDER BY table_name
    `;
    
    const tablesResult = await localClient.query(createTablesQuery);
    
    // Crear enums primero
    console.log('📋 Creando enums...');
    const enumsQuery = `
      SELECT 
        'CREATE TYPE ' || quote_ident(t.typname) || ' AS ENUM (' ||
        string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) ||
        ');' as create_enum
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.typname
      ORDER BY t.typname
    `;
    
    const enumsResult = await localClient.query(enumsQuery);
    
    // Ejecutar creación de enums
    for (const enumRow of enumsResult.rows) {
      try {
        await supabaseClient.query(enumRow.create_enum);
        console.log('✅ Enum creado');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log('❌ Error creando enum:', error.message.substring(0, 50));
        }
      }
    }
    
    // Ejecutar creación de tablas
    for (const table of tablesResult.rows) {
      try {
        await supabaseClient.query(table.create_statement);
        console.log(`✅ Tabla ${table.table_name} creada`);
      } catch (error) {
        console.log(`❌ Error creando ${table.table_name}:`, error.message.substring(0, 100));
      }
    }
    
    // 2. COPIAR DATOS TABLA POR TABLA
    console.log('\n📋 2. Copiando datos...');
    
    const dataTablesResult = await localClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '%migrations%'
      ORDER BY table_name
    `);
    
    let totalInserted = 0;
    
    for (const table of dataTablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n📦 Procesando: ${tableName}`);
      
      try {
        // Obtener datos
        const dataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
        console.log(`   📊 Registros locales: ${dataResult.rows.length}`);
        
        if (dataResult.rows.length > 0) {
          // Limpiar tabla destino
          await supabaseClient.query(`DELETE FROM "${tableName}"`);
          
          // Preparar inserción en lotes de 100
          const batchSize = 100;
          for (let i = 0; i < dataResult.rows.length; i += batchSize) {
            const batch = dataResult.rows.slice(i, i + batchSize);
            const columns = Object.keys(batch[0]);
            
            const values = batch.map(row => 
              '(' + columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `$${col}$${val}$${col}$`;
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'boolean') return val.toString();
                return val;
              }).join(', ') + ')'
            ).join(', ');
            
            const insertQuery = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${values}`;
            
            await supabaseClient.query(insertQuery);
            totalInserted += batch.length;
            console.log(`   ✅ Lote ${Math.ceil((i + batch.length) / batchSize)} insertado`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error en ${tableName}: ${error.message.substring(0, 100)}`);
      }
    }
    
    console.log(`\n🎉 ¡Clonación completada!`);
    console.log(`📊 Total de registros insertados: ${totalInserted}`);
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

smartClone();
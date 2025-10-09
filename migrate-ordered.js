const { Client } = require('pg');

// Configuración de conexiones
const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

// Orden correcto de tablas (sin dependencias primero)
const TABLE_ORDER = [
  // Tablas base sin dependencias
  'users', 'accounts', 'sessions', 'verification_tokens',
  'colors', 'textures', 'molding_colors', 'molding_textures',
  'pricing_thickness', 'pricing_accessory', 'pricing_backing', 
  'pricing_frame_preset', 'pricing_glass', 'pricing_matboard', 
  'pricing_molding',
  
  // Tablas con dependencias simples
  'Company',
  'User', // depende de Company
  'BankAccount', 'Branch', 'Wallet', // dependen de Company
  'Client', // depende de Company
  
  // Tablas con más dependencias
  'Quote', // depende de Company, User, Client
  'QuoteItem', 'Observation', // dependen de Quote
  'Contract', // depende de Quote
  'ContractItem', 'Payment' // dependen de Contract
];

async function migrateInOrder() {
  const localClient = new Client(LOCAL_DB);
  const supabaseClient = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a base de datos local...');
    await localClient.connect();
    
    console.log('🔄 Conectando a Supabase...');
    await supabaseClient.connect();
    
    console.log('📋 Iniciando migración ordenada...\n');
    
    for (const tableName of TABLE_ORDER) {
      console.log(`📦 Procesando tabla: ${tableName}`);
      
      try {
        // Verificar si la tabla existe en local
        const localCheck = await localClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          )
        `);
        
        if (!localCheck.rows[0].exists) {
          console.log(`   ⚠️  Tabla ${tableName} no existe en local, saltando...`);
          continue;
        }
        
        // Obtener datos de la tabla local
        const dataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
        console.log(`   📊 Registros en local: ${dataResult.rows.length}`);
        
        if (dataResult.rows.length === 0) {
          console.log(`   ⏭️  Tabla vacía, saltando...`);
          continue;
        }
        
        // Verificar si la tabla existe en Supabase
        const supabaseCheck = await supabaseClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          )
        `);
        
        if (!supabaseCheck.rows[0].exists) {
          console.log(`   ⚠️  Tabla ${tableName} no existe en Supabase, saltando...`);
          continue;
        }
        
        // Limpiar tabla en Supabase
        await supabaseClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        console.log(`   🧹 Tabla limpiada en Supabase`);
        
        // Preparar inserción
        const columns = Object.keys(dataResult.rows[0]);
        const columnNames = columns.map(c => `"${c}"`).join(', ');
        
        // Insertar registro por registro para evitar problemas con comillas
        let insertedCount = 0;
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            return val;
          }).join(', ');
          
          const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values})`;
          
          try {
            await supabaseClient.query(insertQuery);
            insertedCount++;
          } catch (insertError) {
            console.log(`   ⚠️  Error insertando registro en ${tableName}:`, insertError.message);
          }
        }
        
        console.log(`   ✅ ${insertedCount}/${dataResult.rows.length} registros insertados`);
        
      } catch (error) {
        console.log(`   ❌ Error procesando tabla ${tableName}:`, error.message);
      }
      
      console.log(''); // Línea en blanco
    }
    
    console.log('🎉 ¡Migración completada!');
    
    // Verificar resultados
    console.log('\n📊 Verificando resultados en Supabase:');
    const mainTables = ['Company', 'User', 'Client', 'Quote'];
    
    for (const tableName of mainTables) {
      try {
        const count = await supabaseClient.query(`SELECT COUNT(*) FROM "${tableName}"`);
        console.log(`   ${tableName}: ${count.rows[0].count} registros`);
      } catch (error) {
        console.log(`   ${tableName}: Error o no existe`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

migrateInOrder();
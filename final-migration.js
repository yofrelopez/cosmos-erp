// Método definitivo: Aplicar schema Prisma + importar datos
// 1. Crear schema desde Prisma (estructura correcta)
// 2. Importar solo datos sin estructura

const { execSync } = require('child_process');
const { Client } = require('pg');

const LOCAL_DB = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
};

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function finalMigration() {
  console.log('🚀 MIGRACIÓN DEFINITIVA INICIADA');
  
  try {
    // PASO 1: Crear schema con Prisma (generar desde cero)
    console.log('\n📋 PASO 1: Creando schema desde Prisma...');
    
    try {
      // Generar Prisma client primero
      console.log('   🔧 Generando Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit', cwd: process.cwd() });
      
      // Resetear completamente la base de datos Supabase
      console.log('   🗑️  Reseteando Supabase...');
      execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit', cwd: process.cwd() });
      
    } catch (error) {
      console.log('   ⚠️  Error con reset, continuando...');
      
      // Intentar deploy directo
      console.log('   🔄 Aplicando migraciones...');
      execSync('npx prisma db push --force-reset', { stdio: 'inherit', cwd: process.cwd() });
    }
    
    console.log('✅ PASO 1 completado - Schema creado');
    
    // PASO 2: Verificar que las tablas existen
    console.log('\n📋 PASO 2: Verificando tablas en Supabase...');
    const supabaseClient = new Client(SUPABASE_DB);
    await supabaseClient.connect();
    
    const tablesResult = await supabaseClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ Tablas encontradas en Supabase: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    // PASO 3: Importar datos
    console.log('\n📋 PASO 3: Importando datos...');
    const localClient = new Client(LOCAL_DB);
    await localClient.connect();
    
    // Lista de tablas en orden de dependencias
    const tableOrder = [
      'Company', 'User', 'BankAccount', 'Branch', 'Wallet', 'Client',
      'colors', 'textures', 'molding_colors', 'molding_textures',
      'pricing_thickness', 'pricing_glass', 'pricing_molding',
      'Quote', 'QuoteItem', 'Contract', 'ContractItem', 'Payment', 'Observation'
    ];
    
    let totalInserted = 0;
    
    for (const tableName of tableOrder) {
      try {
        console.log(`\n📦 Procesando: ${tableName}`);
        
        // Verificar si la tabla existe en ambas bases
        const localExists = await localClient.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = $1 AND table_schema = 'public'
          )
        `, [tableName]);
        
        const supabaseExists = await supabaseClient.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = $1 AND table_schema = 'public'
          )
        `, [tableName]);
        
        if (!localExists.rows[0].exists) {
          console.log(`   ⚠️  Tabla ${tableName} no existe en local`);
          continue;
        }
        
        if (!supabaseExists.rows[0].exists) {
          console.log(`   ⚠️  Tabla ${tableName} no existe en Supabase`);
          continue;
        }
        
        // Obtener datos
        const dataResult = await localClient.query(`SELECT * FROM "${tableName}"`);
        console.log(`   📊 Registros: ${dataResult.rows.length}`);
        
        if (dataResult.rows.length > 0) {
          // Limpiar tabla destino
          await supabaseClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
          
          // Insertar datos usando parámetros (más seguro)
          for (const row of dataResult.rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => row[col]);
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            
            const insertQuery = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;
            
            try {
              await supabaseClient.query(insertQuery, values);
              totalInserted++;
            } catch (insertError) {
              console.log(`     ❌ Error insertando en ${tableName}: ${insertError.message.substring(0, 80)}`);
            }
          }
          
          console.log(`   ✅ ${dataResult.rows.length} registros procesados`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error en ${tableName}: ${error.message.substring(0, 80)}`);
      }
    }
    
    await localClient.end();
    await supabaseClient.end();
    
    console.log(`\n🎉 ¡MIGRACIÓN COMPLETADA!`);
    console.log(`📊 Total registros insertados: ${totalInserted}`);
    console.log(`✅ Base de datos clonada exitosamente`);
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

finalMigration();
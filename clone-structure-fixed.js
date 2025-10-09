const { Client } = require('pg');

// Configuración de conexiones
const localConfig = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos',
  connectionTimeoutMillis: 5000
};

const supabaseConfig = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function cloneStructureSimple() {
  const localClient = new Client(localConfig);
  const supabaseClient = new Client(supabaseConfig);

  try {
    console.log('🔌 Conectando a las bases de datos...');
    await localClient.connect();
    await supabaseClient.connect();
    
    console.log('✅ Conexiones establecidas');

    // Crear los enums manualmente basándose en tu archivo SQL
    console.log('\n🔄 Creando enums en Supabase...');
    
    const enums = [
      `CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE','INACTIVE','CLOSED');`,
      `CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE','INACTIVE','SUSPENDED');`,
      `CREATE TYPE "Currency" AS ENUM ('PEN','USD','EUR');`,
      `CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING','PARTIAL','DELIVERED');`,
      `CREATE TYPE "DocumentType" AS ENUM ('DNI','RUC','CE','PASSPORT');`,
      `CREATE TYPE "GlassColorType" AS ENUM ('INCOLORO','COLOR','POLARIZADO','REFLEJANTE');`,
      `CREATE TYPE "GlassFamily" AS ENUM ('PLANO','CATEDRAL','TEMPLADO','ESPEJO');`,
      `CREATE TYPE "GlassTexture" AS ENUM ('LISO','CUADRICULADO','LLOVIZNA','GARATACHI','FLORA','MARIHUANA','RAMAS');`,
      `CREATE TYPE "PaymentMethod" AS ENUM ('CASH','TRANSFER','CARD','YAPE','PLIN','OTHER');`,
      `CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','PARTIAL','PAID');`,
      `CREATE TYPE "PricingFrameKind" AS ENUM ('SIN_FONDO','CON_FONDO','FONDO_TRANSPARENTE','CON_BASTIDOR','ESPECIAL');`,
      `CREATE TYPE "PricingMoldingQuality" AS ENUM ('SIMPLE','FINA','BASTIDOR');`,
      `CREATE TYPE "QuoteStatus" AS ENUM ('PENDING','ACCEPTED','REJECTED');`,
      `CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN','ADMIN','OPERATOR');`,
      `CREATE TYPE "WalletType" AS ENUM ('YAPE','PLIN');`
    ];

    let enumsCreated = 0;
    for (const enumSQL of enums) {
      try {
        // Extraer nombre del enum
        const enumName = enumSQL.match(/CREATE TYPE "(\w+)"/)[1];
        
        // Eliminar si existe
        await supabaseClient.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
        
        // Crear el enum
        await supabaseClient.query(enumSQL);
        console.log(`✅ Enum "${enumName}" creado`);
        enumsCreated++;
        
      } catch (error) {
        console.error(`❌ Error creando enum:`, error.message);
      }
    }

    // Obtener y crear tablas usando pg_dump pero solo DDL
    console.log('\n🔄 Obteniendo DDL de tablas desde local...');
    
    // Lista de tablas en el orden correcto
    const tableNames = [
      'Company', 'Branch', 'BankAccount', 'Wallet', 'Client',
      'users', 'colors', 'textures', 'molding_colors', 'molding_textures',
      'pricing_thickness', 'pricing_glass', 'pricing_molding',
      'Quote', 'QuoteItem', 'accounts', 'sessions', 'verification_tokens',
      'Contract', 'ContractItem', 'Payment', 'Observation',
      'pricing_accessory', 'pricing_backing', 'pricing_frame_preset', 'pricing_matboard'
    ];

    let tablesCreated = 0;
    
    for (const tableName of tableNames) {
      try {
        // Verificar si la tabla existe
        const tableCheck = await localClient.query(
          `SELECT table_name FROM information_schema.tables WHERE table_name = $1 AND table_schema = 'public'`,
          [tableName]
        );
        
        if (tableCheck.rows.length === 0) {
          console.log(`⚠️  Tabla "${tableName}" no existe en local`);
          continue;
        }

        // Eliminar tabla si existe en Supabase
        await supabaseClient.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);

        // Obtener DDL completo usando información del schema
        const ddlQuery = `
          SELECT 
            'CREATE TABLE "' || $1 || '" (' ||
            string_agg(
              '"' || column_name || '" ' ||
              CASE 
                WHEN data_type = 'USER-DEFINED' THEN '"' || udt_name || '"'
                WHEN data_type = 'character varying' THEN 
                  CASE WHEN character_maximum_length IS NOT NULL 
                       THEN 'VARCHAR(' || character_maximum_length || ')'
                       ELSE 'VARCHAR' END
                WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
                WHEN data_type = 'numeric' THEN 
                  CASE WHEN numeric_precision IS NOT NULL 
                       THEN 'NUMERIC(' || numeric_precision || ',' || COALESCE(numeric_scale, 0) || ')'
                       ELSE 'NUMERIC' END
                WHEN data_type = 'integer' THEN 'INTEGER'
                WHEN data_type = 'bigint' THEN 'BIGINT'
                WHEN data_type = 'smallint' THEN 'SMALLINT'
                WHEN data_type = 'boolean' THEN 'BOOLEAN'
                WHEN data_type = 'text' THEN 'TEXT'
                WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
                WHEN data_type = 'date' THEN 'DATE'
                WHEN data_type = 'time without time zone' THEN 'TIME'
                WHEN data_type = 'double precision' THEN 'DOUBLE PRECISION'
                WHEN data_type = 'real' THEN 'REAL'
                WHEN data_type = 'json' THEN 'JSON'
                WHEN data_type = 'jsonb' THEN 'JSONB'
                WHEN data_type = 'uuid' THEN 'UUID'
                ELSE UPPER(data_type)
              END ||
              CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
              CASE 
                WHEN column_default IS NOT NULL AND column_default NOT LIKE 'nextval%' 
                THEN ' DEFAULT ' || column_default 
                ELSE '' 
              END,
              ', ' ORDER BY ordinal_position
            ) || 
            ');' as create_statement
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          GROUP BY table_name;
        `;
        
        const ddlResult = await localClient.query(ddlQuery, [tableName]);
        
        if (ddlResult.rows.length > 0) {
          let createStatement = ddlResult.rows[0].create_statement;
          
          // Crear la tabla
          await supabaseClient.query(createStatement);
          
          // Si tiene campo id como serial, crear la secuencia
          const hasIdSerial = await localClient.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = $1 AND column_name = 'id' AND column_default LIKE 'nextval%'`,
            [tableName]
          );
          
          if (hasIdSerial.rows.length > 0) {
            try {
              await supabaseClient.query(`CREATE SEQUENCE IF NOT EXISTS "${tableName}_id_seq";`);
              await supabaseClient.query(`ALTER TABLE "${tableName}" ALTER COLUMN id SET DEFAULT nextval('"${tableName}_id_seq"');`);
              await supabaseClient.query(`ALTER SEQUENCE "${tableName}_id_seq" OWNED BY "${tableName}".id;`);
            } catch (seqError) {
              // Las secuencias pueden fallar, no es crítico
              console.log(`⚠️  Secuencia para "${tableName}" omitida`);
            }
          }
          
          console.log(`✅ Tabla "${tableName}" creada`);
          tablesCreated++;
        }
        
      } catch (error) {
        console.error(`❌ Error creando tabla "${tableName}":`, error.message);
      }
    }

    console.log('\n🎉 ¡Clonación de estructura completada!');
    console.log(`✅ ${enumsCreated} enums creados`);
    console.log(`✅ ${tablesCreated} tablas creadas`);
    console.log('\n📝 Ahora puedes ejecutar el archivo supabase-final-limpio.sql para insertar los datos');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

cloneStructureSimple().catch(console.error);
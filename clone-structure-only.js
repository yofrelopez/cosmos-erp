const { Client } = require('pg');

// Configuración de conexiones
const localConfig = {
  connectionString: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos',
  connectionTimeoutMillis: 5000
};

const supabaseConfig = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function cloneStructureOnly() {
  const localClient = new Client(localConfig);
  const supabaseClient = new Client(supabaseConfig);

  try {
    console.log('🔌 Conectando a las bases de datos...');
    await localClient.connect();
    await supabaseClient.connect();
    
    console.log('✅ Conexiones establecidas');

    // 1. OBTENER TODOS LOS ENUMS DE LA BASE LOCAL
    console.log('\n📋 Obteniendo enums de la base local...');
    const enumsQuery = `
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    const enumsResult = await localClient.query(enumsQuery);
    console.log(`📊 Encontrados ${enumsResult.rows.length} enums`);

    // 2. CREAR ENUMS EN SUPABASE
    console.log('\n🔄 Creando enums en Supabase...');
    let enumsCreated = 0;
    
    for (const enumRow of enumsResult.rows) {
      const { enum_name, enum_values } = enumRow;
      
      try {
        // Primero eliminar si existe
        await supabaseClient.query(`DROP TYPE IF EXISTS "${enum_name}" CASCADE;`);
        
        // Crear el enum
        const createEnumSQL = `CREATE TYPE "${enum_name}" AS ENUM (${enum_values.map(val => `'${val}'`).join(',')});`;
        await supabaseClient.query(createEnumSQL);
        
        console.log(`✅ Enum "${enum_name}" creado`);
        enumsCreated++;
        
      } catch (error) {
        console.error(`❌ Error creando enum "${enum_name}":`, error.message);
      }
    }

    // 3. OBTENER ESTRUCTURA DE TABLAS
    console.log('\n📋 Obteniendo estructura de tablas...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma%'
      ORDER BY table_name;
    `;
    
    const tablesResult = await localClient.query(tablesQuery);
    console.log(`📊 Encontradas ${tablesResult.rows.length} tablas`);

    // 4. CLONAR CADA TABLA
    console.log('\n🔄 Clonando estructura de tablas...');
    let tablesCreated = 0;
    
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      
      try {
        // Obtener el DDL de la tabla
        const ddlQuery = `
          SELECT 
            'CREATE TABLE "' || table_name || '" (' || string_agg(column_definition, ', ') || ');' as create_statement
          FROM (
            SELECT 
              table_name,
              '"' || column_name || '" ' || 
              CASE 
                WHEN data_type = 'USER-DEFINED' THEN '"' || udt_name || '"'
                WHEN data_type = 'character varying' THEN 'VARCHAR' || COALESCE('(' || character_maximum_length || ')', '')
                WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
                WHEN data_type = 'numeric' THEN 'NUMERIC' || COALESCE('(' || numeric_precision || ',' || numeric_scale || ')', '')
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
              CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END
              as column_definition,
              ordinal_position
            FROM information_schema.columns 
            WHERE table_name = $1 
              AND table_schema = 'public'
            ORDER BY ordinal_position
          ) t
          GROUP BY table_name;
        `;
        
        const ddlResult = await localClient.query(ddlQuery, [tableName]);
        
        if (ddlResult.rows.length > 0) {
          const createStatement = ddlResult.rows[0].create_statement;
          
          // Eliminar tabla si existe
          await supabaseClient.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
          
          // Crear la tabla
          await supabaseClient.query(createStatement);
          
          console.log(`✅ Tabla "${tableName}" creada`);
          tablesCreated++;
        }
        
      } catch (error) {
        console.error(`❌ Error creando tabla "${tableName}":`, error.message);
      }
    }

    // 5. AGREGAR CONSTRAINTS Y FOREIGN KEYS
    console.log('\n🔗 Agregando constraints...');
    
    const constraintsQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name 
        AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints rc 
        ON tc.constraint_name = rc.constraint_name 
        AND tc.table_schema = rc.constraint_schema
      WHERE tc.table_schema = 'public' 
        AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
        AND tc.table_name NOT LIKE '_prisma%'
      ORDER BY tc.constraint_type, tc.table_name, tc.constraint_name;
    `;
    
    const constraintsResult = await localClient.query(constraintsQuery);
    let constraintsAdded = 0;
    
    for (const constraint of constraintsResult.rows) {
      try {
        let alterSQL = '';
        
        if (constraint.constraint_type === 'PRIMARY KEY') {
          alterSQL = `ALTER TABLE "${constraint.table_name}" ADD CONSTRAINT "${constraint.constraint_name}" PRIMARY KEY ("${constraint.column_name}");`;
        } else if (constraint.constraint_type === 'FOREIGN KEY') {
          alterSQL = `ALTER TABLE "${constraint.table_name}" ADD CONSTRAINT "${constraint.constraint_name}" FOREIGN KEY ("${constraint.column_name}") REFERENCES "${constraint.foreign_table_name}"("${constraint.foreign_column_name}");`;
        } else if (constraint.constraint_type === 'UNIQUE') {
          alterSQL = `ALTER TABLE "${constraint.table_name}" ADD CONSTRAINT "${constraint.constraint_name}" UNIQUE ("${constraint.column_name}");`;
        }
        
        if (alterSQL) {
          await supabaseClient.query(alterSQL);
          constraintsAdded++;
        }
        
      } catch (error) {
        // Los constraints pueden fallar si ya existen, no es crítico
        console.log(`⚠️  Constraint "${constraint.constraint_name}" omitido`);
      }
    }

    console.log('\n🎉 ¡Clonación de estructura completada!');
    console.log(`✅ ${enumsCreated} enums creados`);
    console.log(`✅ ${tablesCreated} tablas creadas`);
    console.log(`✅ ${constraintsAdded} constraints agregados`);
    console.log('\n📝 Ahora puedes ejecutar el archivo supabase-final-limpio.sql para insertar los datos');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await localClient.end();
    await supabaseClient.end();
  }
}

cloneStructureOnly().catch(console.error);
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
  connectionTimeoutMillis: 10000, // 10 segundos timeout
});

async function testConnection() {
  try {
    console.log('🔄 Conectando a Supabase...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!');
    
    console.log('🔍 Probando consulta simple...');
    const result = await client.query('SELECT version()');
    console.log('📋 Versión de PostgreSQL:', result.rows[0].version);
    
    console.log('📊 Listando tablas...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('🗂️  Tablas encontradas:', tables.rows.length);
    tables.rows.forEach(row => console.log('   -', row.table_name));
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
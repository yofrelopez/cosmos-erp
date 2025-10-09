// test-prisma-connection.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Probando conexión a Supabase con Prisma...');
    
    // Test 1: Conexión básica
    console.log('📡 Verificando conexión...');
    await prisma.$connect();
    console.log('✅ Conexión establecida exitosamente');
    
    // Test 2: Query de prueba
    console.log('🔎 Consultando empresas...');
    const companies = await prisma.company.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, logoUrl: true, ruc: true, status: true },
      orderBy: { name: 'asc' },
    });
    
    console.log('📊 Empresas encontradas:', companies.length);
    console.log('📋 Datos:', JSON.stringify(companies, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error('📄 Detalles completos:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔚 Conexión cerrada');
  }
}

testConnection();
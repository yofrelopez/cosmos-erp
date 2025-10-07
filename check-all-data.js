import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 VERIFICANDO ESTADO COMPLETO DE LA BASE DE DATOS');
    console.log('=' .repeat(60));
    
    // Empresas
    const companies = await prisma.company.findMany();
    console.log(`🏢 EMPRESAS: ${companies.length} encontradas`);
    companies.forEach((c, i) => console.log(`   ${i+1}. ${c.name} (ID: ${c.id})`));
    
    // Usuarios  
    const users = await prisma.user.findMany();
    console.log(`\n👤 USUARIOS: ${users.length} encontrados`);
    users.forEach((u, i) => console.log(`   ${i+1}. ${u.name} - ${u.email} (CompanyID: ${u.companyId})`));
    
    // Clientes
    const clients = await prisma.client.findMany();
    console.log(`\n👥 CLIENTES: ${clients.length} encontrados`);
    clients.forEach((c, i) => console.log(`   ${i+1}. ${c.name} - ${c.documentNumber} (CompanyID: ${c.companyId})`));
    
    // Cotizaciones
    const quotes = await prisma.quote.findMany();
    console.log(`\n📋 COTIZACIONES: ${quotes.length} encontradas`);
    quotes.forEach((q, i) => console.log(`   ${i+1}. ${q.code} - Status: ${q.status} (CompanyID: ${q.companyId})`));
    
    // Items de cotización
    const quoteItems = await prisma.quoteItem.findMany();
    console.log(`\n📝 ITEMS DE COTIZACIÓN: ${quoteItems.length} encontrados`);
    
    // Sucursales
    const branches = await prisma.branch.findMany();
    console.log(`\n🏪 SUCURSALES: ${branches.length} encontradas`);
    
    // Cuentas bancarias
    const bankAccounts = await prisma.bankAccount.findMany();
    console.log(`\n🏦 CUENTAS BANCARIAS: ${bankAccounts.length} encontradas`);
    
    // Wallets
    const wallets = await prisma.wallet.findMany();
    console.log(`\n💰 WALLETS: ${wallets.length} encontradas`);
    
  } catch (error) {
    console.error('❌ Error al verificar datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
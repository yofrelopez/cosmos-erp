// Script para exportar datos de PostgreSQL local a formato SQL
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:admin123@localhost:5432/erp_vd_cosmos'
    }
  }
});

async function exportData() {
  console.log('🔍 Exportando datos de PostgreSQL local...\n');

  let sql = '-- Datos exportados de PostgreSQL local\n';
  sql += '-- Generado: ' + new Date().toISOString() + '\n\n';
  sql += 'BEGIN;\n\n';

  try {
    // 1. Companies
    const companies = await prisma.company.findMany();
    console.log(`✅ Empresas: ${companies.length}`);
    for (const c of companies) {
      sql += `INSERT INTO "Company" ("id", "name", "ruc", "address", "phone", "whatsapp", "email", "facebookUrl", "instagramUrl", "tiktokUrl", "slogan", "description", "legalRepresentative", "administrator", "isActive", "createdAt", "updatedAt") VALUES ('${c.id}', ${escape(c.name)}, ${escape(c.ruc)}, ${escape(c.address)}, ${escape(c.phone)}, ${escape(c.whatsapp)}, ${escape(c.email)}, ${escape(c.facebookUrl)}, ${escape(c.instagramUrl)}, ${escape(c.tiktokUrl)}, ${escape(c.slogan)}, ${escape(c.description)}, ${escape(c.legalRepresentative)}, ${escape(c.administrator)}, ${c.isActive}, '${c.createdAt.toISOString()}', '${c.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 2. Users
    const users = await prisma.user.findMany();
    console.log(`✅ Usuarios: ${users.length}`);
    for (const u of users) {
      sql += `INSERT INTO "User" ("id", "companyId", "name", "username", "email", "password", "role", "isActive", "createdAt", "updatedAt") VALUES ('${u.id}', ${escape(u.companyId)}, ${escape(u.name)}, ${escape(u.username)}, ${escape(u.email)}, ${escape(u.password)}, '${u.role}', ${u.isActive}, '${u.createdAt.toISOString()}', '${u.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 3. Branches
    const branches = await prisma.branch.findMany();
    console.log(`✅ Sucursales: ${branches.length}`);
    for (const b of branches) {
      sql += `INSERT INTO "Branch" ("id", "companyId", "name", "address", "phone", "createdAt", "updatedAt") VALUES ('${b.id}', '${b.companyId}', ${escape(b.name)}, ${escape(b.address)}, ${escape(b.phone)}, '${b.createdAt.toISOString()}', '${b.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 4. BankAccounts
    const bankAccounts = await prisma.bankAccount.findMany();
    console.log(`✅ Cuentas bancarias: ${bankAccounts.length}`);
    for (const ba of bankAccounts) {
      sql += `INSERT INTO "BankAccount" ("id", "companyId", "bank", "accountType", "alias", "number", "cci", "currency", "createdAt", "updatedAt") VALUES ('${ba.id}', '${ba.companyId}', ${escape(ba.bank)}, ${escape(ba.accountType)}, ${escape(ba.alias)}, ${escape(ba.number)}, ${escape(ba.cci)}, '${ba.currency}', '${ba.createdAt.toISOString()}', '${ba.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 5. Wallets
    const wallets = await prisma.wallet.findMany();
    console.log(`✅ Billeteras: ${wallets.length}`);
    for (const w of wallets) {
      sql += `INSERT INTO "Wallet" ("id", "companyId", "type", "phone", "qrUrl", "createdAt", "updatedAt") VALUES ('${w.id}', '${w.companyId}', '${w.type}', ${escape(w.phone)}, ${escape(w.qrUrl)}, '${w.createdAt.toISOString()}', '${w.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 6. Clients
    const clients = await prisma.client.findMany();
    console.log(`✅ Clientes: ${clients.length}`);
    for (const c of clients) {
      sql += `INSERT INTO "Client" ("id", "companyId", "documentType", "documentNumber", "fullName", "businessName", "email", "phone", "address", "createdAt", "updatedAt") VALUES ('${c.id}', '${c.companyId}', '${c.documentType}', ${escape(c.documentNumber)}, ${escape(c.fullName)}, ${escape(c.businessName)}, ${escape(c.email)}, ${escape(c.phone)}, ${escape(c.address)}, '${c.createdAt.toISOString()}', '${c.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 7. PricingThickness
    const thicknesses = await prisma.pricingThickness.findMany();
    console.log(`✅ Espesores: ${thicknesses.length}`);
    for (const t of thicknesses) {
      sql += `INSERT INTO "PricingThickness" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES ('${t.id}', '${t.companyId}', '${t.name}', '${t.createdAt.toISOString()}', '${t.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 8. MoldingTexture
    const textures = await prisma.moldingTexture.findMany();
    console.log(`✅ Texturas: ${textures.length}`);
    for (const t of textures) {
      sql += `INSERT INTO "MoldingTexture" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES ('${t.id}', '${t.companyId}', ${escape(t.name)}, '${t.createdAt.toISOString()}', '${t.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 9. MoldingColor
    const colors = await prisma.moldingColor.findMany();
    console.log(`✅ Colores de molduras: ${colors.length}`);
    for (const c of colors) {
      sql += `INSERT INTO "MoldingColor" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES ('${c.id}', '${c.companyId}', ${escape(c.name)}, '${c.createdAt.toISOString()}', '${c.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 10. PricingMolding
    const moldings = await prisma.pricingMolding.findMany();
    console.log(`✅ Molduras: ${moldings.length}`);
    for (const m of moldings) {
      sql += `INSERT INTO "PricingMolding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "createdAt", "updatedAt") VALUES ('${m.id}', '${m.companyId}', ${escape(m.name)}, '${m.quality}', '${m.thicknessId}', ${m.pricePerM}, '${m.createdAt.toISOString()}', '${m.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 11. Quotes
    const quotes = await prisma.quote.findMany();
    console.log(`✅ Cotizaciones: ${quotes.length}`);
    for (const q of quotes) {
      sql += `INSERT INTO "Quote" ("id", "companyId", "code", "clientId", "status", "notes", "createdById", "createdAt", "updatedAt") VALUES ('${q.id}', '${q.companyId}', ${escape(q.code)}, '${q.clientId}', '${q.status}', ${escape(q.notes)}, '${q.createdById}', '${q.createdAt.toISOString()}', '${q.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 12. QuoteItems
    const quoteItems = await prisma.quoteItem.findMany();
    console.log(`✅ Items de cotizaciones: ${quoteItems.length}`);
    for (const qi of quoteItems) {
      sql += `INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal", "createdAt", "updatedAt") VALUES ('${qi.id}', '${qi.quoteId}', ${escape(qi.description)}, ${escape(qi.unit)}, ${qi.quantity}, ${qi.unitPrice}, ${qi.subtotal}, '${qi.createdAt.toISOString()}', '${qi.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    // 13. PricingGlass (si existen)
    const glasses = await prisma.pricingGlass.findMany();
    console.log(`✅ Vidrios: ${glasses.length}`);
    for (const g of glasses) {
      sql += `INSERT INTO "PricingGlass" ("id", "companyId", "name", "family", "thickness", "colorType", "basePrice", "createdAt", "updatedAt") VALUES ('${g.id}', ${escape(g.companyId)}, ${escape(g.name)}, '${g.family}', '${g.thickness}', '${g.colorType}', ${g.basePrice}, '${g.createdAt.toISOString()}', '${g.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }
    sql += '\n';

    sql += 'COMMIT;\n';

    // Guardar en archivo
    fs.writeFileSync('datos-exportados.sql', sql);
    console.log('\n✅ Datos exportados a: datos-exportados.sql');
    console.log('📋 Ejecuta este archivo en el SQL Editor de Supabase');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function escape(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return String(value);
}

exportData();

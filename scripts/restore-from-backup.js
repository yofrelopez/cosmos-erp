const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // Para hacer peticiones HTTP directas

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesFromBackup() {
  console.log('🔧 Creando tablas basándose en el backup...');
  
  // Ejecutar SQL directamente usando la función query de Supabase
  const sqlCommands = [
    // ENUMs
    `CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERATOR')`,
    `CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    `CREATE TYPE "DocumentType" AS ENUM ('DNI', 'RUC', 'CE', 'PASSPORT')`,
    `CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED')`,
    `CREATE TYPE "GlassFamily" AS ENUM ('PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO')`,
    `CREATE TYPE "GlassColorType" AS ENUM ('INCOLORO', 'COLOR', 'POLARIZADO', 'REFLEJANTE')`,
    `CREATE TYPE "PricingMoldingQuality" AS ENUM ('SIMPLE', 'FINA', 'BASTIDOR')`,
    
    // Tabla companies
    `CREATE TABLE "companies" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        ruc TEXT NOT NULL,
        "logoUrl" TEXT,
        address TEXT,
        phone TEXT,
        whatsapp TEXT,
        "facebookUrl" TEXT,
        "instagramUrl" TEXT,
        "tiktokUrl" TEXT,
        email TEXT,
        website TEXT,
        slogan TEXT,
        description TEXT,
        notes TEXT,
        "legalRepresentative" TEXT,
        administrator TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        status "CompanyStatus" NOT NULL DEFAULT 'ACTIVE'
    )`,

    // Tabla users
    `CREATE TABLE "users" (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        role "UserRole" NOT NULL DEFAULT 'OPERATOR',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "companyId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla clients
    `CREATE TABLE "clients" (
        id SERIAL PRIMARY KEY,
        "documentType" "DocumentType" NOT NULL,
        "documentNumber" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "contactPerson" TEXT,
        "businessName" TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        notes TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "companyId" INTEGER NOT NULL,
        CONSTRAINT "clients_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla pricingThickness
    `CREATE TABLE "pricingThickness" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        CONSTRAINT "pricingThickness_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla pricingMolding
    `CREATE TABLE "pricingMolding" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        quality "PricingMoldingQuality" NOT NULL,
        "thicknessId" INTEGER NOT NULL,
        "pricePerM" DECIMAL(10,2) NOT NULL,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validTo" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "pricingMolding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id),
        CONSTRAINT "pricingMolding_thicknessId_fkey" FOREIGN KEY ("thicknessId") REFERENCES "pricingThickness"(id)
    )`,

    // Tabla pricingGlass
    `CREATE TABLE "pricingGlass" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        "commercialName" TEXT NOT NULL,
        family "GlassFamily" NOT NULL,
        "thicknessMM" TEXT NOT NULL,
        "colorType" "GlassColorType" NOT NULL,
        "colorId" INTEGER,
        "oldColor" TEXT,
        price DECIMAL(10,2) NOT NULL,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validTo" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "pricingGlass_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla pricingMatboard
    `CREATE TABLE "pricingMatboard" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        "pricePerFt2" DECIMAL(10,2) NOT NULL,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validTo" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "pricingMatboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla pricingBacking
    `CREATE TABLE "pricingBacking" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        "pricePerFt2" DECIMAL(10,2) NOT NULL,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validTo" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "pricingBacking_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla moldingTextures
    `CREATE TABLE "moldingTextures" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "moldingTextures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla moldingColors
    `CREATE TABLE "moldingColors" (
        id SERIAL PRIMARY KEY,
        "companyId" INTEGER NOT NULL,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "moldingColors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id)
    )`,

    // Tabla colors
    `CREATE TABLE "colors" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    )`,

    // Tabla textures
    `CREATE TABLE "textures" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    )`,

    // Tabla quotes
    `CREATE TABLE "quotes" (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL,
        "clientId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status "QuoteStatus" NOT NULL DEFAULT 'PENDING',
        notes TEXT,
        total DECIMAL(10,2),
        "createdById" TEXT,
        "companyId" INTEGER NOT NULL,
        CONSTRAINT "quotes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"(id),
        CONSTRAINT "quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"(id),
        CONSTRAINT "quotes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"(id)
    )`,

    // Tabla QuoteItem
    `CREATE TABLE "QuoteItem" (
        id SERIAL PRIMARY KEY,
        "quoteId" INTEGER NOT NULL,
        description TEXT NOT NULL,
        unit TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"(id) ON DELETE CASCADE
    )`
  ];

  // Ejecutar comando por comando
  for (let i = 0; i < sqlCommands.length; i++) {
    try {
      console.log(`Ejecutando comando ${i + 1}/${sqlCommands.length}...`);
      await supabase.from('_none').select('*').limit(0); // Para asegurar conexión
      
      // Usar fetch directamente para SQL DDL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: sqlCommands[i] })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`⚠️ Comando ${i + 1} falló (puede ser normal si ya existe): ${error}`);
      }
    } catch (error) {
      console.log(`⚠️ Comando ${i + 1} falló: ${error.message}`);
    }
  }
  
  console.log('✅ Tablas procesadas (algunas pueden haber fallado si ya existían)');
}

async function restoreFromBackup() {
  try {
    console.log('📖 Leyendo archivo backup...');
    const backupData = JSON.parse(fs.readFileSync('backup-real-data-2025-10-18T15-52-13-277Z.json', 'utf8'));
    
    console.log(`⏰ Backup del: ${backupData.timestamp}`);
    
    // Crear tablas primero
    await createTablesFromBackup();
    
    // Restaurar en orden correcto (respetando foreign keys)
    
    // 1. Companies
    if (backupData.companies?.length > 0) {
      console.log(`📋 Insertando ${backupData.companies.length} empresas...`);
      const { error } = await supabase.from('companies').insert(backupData.companies);
      if (error) throw error;
      console.log('✅ Empresas insertadas');
    }
    
    // 2. Users
    if (backupData.users?.length > 0) {
      console.log(`👥 Insertando ${backupData.users.length} usuarios...`);
      const { error } = await supabase.from('users').insert(backupData.users);
      if (error) throw error;
      console.log('✅ Usuarios insertados');
    }
    
    // 3. Clients
    if (backupData.clients?.length > 0) {
      console.log(`🏢 Insertando ${backupData.clients.length} clientes...`);
      const { error } = await supabase.from('clients').insert(backupData.clients);
      if (error) throw error;
      console.log('✅ Clientes insertados');
    }
    
    // 4. PricingThickness
    if (backupData.pricingThickness?.length > 0) {
      console.log(`📏 Insertando ${backupData.pricingThickness.length} espesores...`);
      const { error } = await supabase.from('pricingThickness').insert(backupData.pricingThickness);
      if (error) throw error;
      console.log('✅ Espesores insertados');
    }
    
    // 5. PricingMolding
    if (backupData.pricingMolding?.length > 0) {
      console.log(`🖼️ Insertando ${backupData.pricingMolding.length} molduras...`);
      const { error } = await supabase.from('pricingMolding').insert(backupData.pricingMolding);
      if (error) throw error;
      console.log('✅ Molduras insertadas');
    }
    
    // 6. PricingGlass
    if (backupData.pricingGlass?.length > 0) {
      console.log(`🪟 Insertando ${backupData.pricingGlass.length} vidrios...`);
      const { error } = await supabase.from('pricingGlass').insert(backupData.pricingGlass);
      if (error) throw error;
      console.log('✅ Vidrios insertados');
    }
    
    // 7. PricingMatboard
    if (backupData.pricingMatboard?.length > 0) {
      console.log(`📄 Insertando ${backupData.pricingMatboard.length} cartulinas...`);
      const { error } = await supabase.from('pricingMatboard').insert(backupData.pricingMatboard);
      if (error) throw error;
      console.log('✅ Cartulinas insertadas');
    }
    
    // 8. PricingBacking
    if (backupData.pricingBacking?.length > 0) {
      console.log(`🔧 Insertando ${backupData.pricingBacking.length} respaldos...`);
      const { error } = await supabase.from('pricingBacking').insert(backupData.pricingBacking);
      if (error) throw error;
      console.log('✅ Respaldos insertados');
    }
    
    // 9. MoldingTextures
    if (backupData.moldingTextures?.length > 0) {
      console.log(`🎨 Insertando ${backupData.moldingTextures.length} texturas de moldura...`);
      const { error } = await supabase.from('moldingTextures').insert(backupData.moldingTextures);
      if (error) throw error;
      console.log('✅ Texturas de moldura insertadas');
    }
    
    // 10. MoldingColors
    if (backupData.moldingColors?.length > 0) {
      console.log(`🌈 Insertando ${backupData.moldingColors.length} colores de moldura...`);
      const { error } = await supabase.from('moldingColors').insert(backupData.moldingColors);
      if (error) throw error;
      console.log('✅ Colores de moldura insertados');
    }
    
    // 11. Colors
    if (backupData.colors?.length > 0) {
      console.log(`🎨 Insertando ${backupData.colors.length} colores...`);
      const { error } = await supabase.from('colors').insert(backupData.colors);
      if (error) throw error;
      console.log('✅ Colores insertados');
    }
    
    // 12. Textures
    if (backupData.textures?.length > 0) {
      console.log(`🔲 Insertando ${backupData.textures.length} texturas...`);
      const { error } = await supabase.from('textures').insert(backupData.textures);
      if (error) throw error;
      console.log('✅ Texturas insertadas');
    }
    
    // 13. Quotes (sin items por ahora)
    if (backupData.quotes?.length > 0) {
      console.log(`📋 Insertando ${backupData.quotes.length} cotizaciones...`);
      const quotesToInsert = backupData.quotes.map(quote => {
        const { items, observations, ...quoteData } = quote;
        return quoteData;
      });
      const { error } = await supabase.from('quotes').insert(quotesToInsert);
      if (error) throw error;
      console.log('✅ Cotizaciones insertadas');
      
      // 14. Quote Items
      const allItems = [];
      backupData.quotes.forEach(quote => {
        if (quote.items?.length > 0) {
          allItems.push(...quote.items);
        }
      });
      
      if (allItems.length > 0) {
        console.log(`📝 Insertando ${allItems.length} items de cotización...`);
        const { error } = await supabase.from('QuoteItem').insert(allItems);
        if (error) throw error;
        console.log('✅ Items de cotización insertados');
      }
    }
    
    console.log('🎉 ¡Backup restaurado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error restaurando backup:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

restoreFromBackup();
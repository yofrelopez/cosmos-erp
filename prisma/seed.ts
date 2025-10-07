import { 
  PrismaClient, 
  QuoteStatus, 
  DocumentType, 
  WalletType, 
  Currency,
  UserRole 
} from '@prisma/client';
import { faker } from '@faker-js/faker/locale/es';

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 Borrando datos existentes...');
  
  // Limpiar en orden inverso para evitar conflictos de FK
  await prisma.observation.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.client.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  
  // Limpiar tablas de molduras y catálogos (tienen companyId)
  await prisma.pricingMolding.deleteMany();
  await prisma.pricingThickness.deleteMany();
  await prisma.moldingTexture.deleteMany();
  await prisma.moldingColor.deleteMany();
  
  await prisma.company.deleteMany();

  console.log('✅ Insertando empresa de prueba...');

  const empresa = await prisma.company.create({
    data: {
      name: 'Vidriería Demo',
      ruc: '20123456789',
      address: 'Av. Principal 123',
      phone: '01-234-5678',
      whatsapp: '987654321',
      email: 'demo@vidrieriademo.com',
      facebookUrl: 'https://facebook.com/vidrieriademo',
      instagramUrl: 'https://instagram.com/vidrieriademo', 
      tiktokUrl: 'https://tiktok.com/@vidrieriademo',
      slogan: 'Calidad cristalina',
      description: 'Empresa especializada en vidrios y marcos',
      legalRepresentative: 'Juan Pérez',
      administrator: 'María García',
    },
  });

  console.log(`→ Empresa creada: ${empresa.name}`);

  // =========================
  // CATÁLOGOS POR EMPRESA
  // =========================
  console.log('✅ Creando catálogos para la empresa...');
  
  // ESPESORES (más de 10 filas)
  const thicknessNames = [
    'MEDIA',
    'TRES_CUARTOS', 
    'UNA_PULGADA',
    'UNA_Y_CUARTO',
    'UNA_Y_MEDIA',
    'DOS_PULGADAS',
    'TRES_PULGADAS',
    'MEDIA_X_MEDIA',
    'MEDIA_X_TRES_CUARTOS',
    'MEDIA_X_UNA_PULGADA',
    'TRES_CUARTOS_X_TRES_CUARTOS',
    'UNA_PULGADA_X_UNA_PULGADA',
    'DOS_X_DOS',
    'DOS_X_TRES',
    'CUATRO_PULGADAS',
  ];
  
  const createdThickness = [];
  for (const name of thicknessNames) {
    const thickness = await prisma.pricingThickness.create({
      data: {
        companyId: empresa.id,
        name,
      },
    });
    createdThickness.push(thickness);
  }

  // TEXTURAS DE MOLDURAS
  const textureNames = [
    'Lisa',
    'Rugosa', 
    'Mate',
    'Brillante',
    'Texturizada',
    'Acanalada',
  ];
  
  for (const name of textureNames) {
    await prisma.moldingTexture.create({
      data: {
        companyId: empresa.id,
        name,
      },
    });
  }

  // COLORES DE MOLDURAS
  const colorNames = [
    'Natural',
    'Dorado',
    'Plateado',
    'Negro',
    'Blanco',
    'Caoba',
  ];
  
  for (const name of colorNames) {
    await prisma.moldingColor.create({
      data: {
        companyId: empresa.id,
        name,
      },
    });
  }

  // MOLDURAS (más de 10 filas con diferentes calidades)
  const moldingData = [
    { name: 'Marco Clásico Simple', quality: 'SIMPLE', thicknessIndex: 0, pricePerM: 15.50 },
    { name: 'Marco Elegante Simple', quality: 'SIMPLE', thicknessIndex: 1, pricePerM: 18.75 },
    { name: 'Marco Moderno Simple', quality: 'SIMPLE', thicknessIndex: 2, pricePerM: 22.30 },
    { name: 'Marco Tradicional Simple', quality: 'SIMPLE', thicknessIndex: 3, pricePerM: 19.80 },
    { name: 'Marco Dorado Fino', quality: 'FINA', thicknessIndex: 4, pricePerM: 45.60 },
    { name: 'Marco Plateado Fino', quality: 'FINA', thicknessIndex: 5, pricePerM: 52.25 },
    { name: 'Marco Ornamentado Fino', quality: 'FINA', thicknessIndex: 6, pricePerM: 67.90 },
    { name: 'Marco Artesanal Fino', quality: 'FINA', thicknessIndex: 2, pricePerM: 58.40 },
    { name: 'Bastidor Básico', quality: 'BASTIDOR', thicknessIndex: 7, pricePerM: 12.75 },
    { name: 'Bastidor Reforzado', quality: 'BASTIDOR', thicknessIndex: 8, pricePerM: 16.20 },
    { name: 'Bastidor Premium', quality: 'BASTIDOR', thicknessIndex: 9, pricePerM: 18.90 },
    { name: 'Bastidor Profesional', quality: 'BASTIDOR', thicknessIndex: 10, pricePerM: 21.45 },
    { name: 'Marco Rústico Simple', quality: 'SIMPLE', thicknessIndex: 11, pricePerM: 24.60 },
  ];
  
  for (const molding of moldingData) {
    await prisma.pricingMolding.create({
      data: {
        companyId: empresa.id,
        name: molding.name,
        quality: molding.quality as any,
        thicknessId: createdThickness[molding.thicknessIndex].id,
        pricePerM: molding.pricePerM,
      },
    });
  }

  console.log(`→ Catálogos y molduras creados para ${empresa.name}`);

  // =========================
  // DATOS OPERACIONALES
  // =========================
  console.log('✅ Creando datos operacionales...');

  // SUCURSALES
  const sucursal = await prisma.branch.create({
    data: {
      companyId: empresa.id,
      name: 'Sucursal Principal',
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
    },
  });

  // CUENTAS BANCARIAS
  await prisma.bankAccount.create({
    data: {
      companyId: empresa.id,
      bank: 'Banco de Crédito del Perú',
      accountType: 'Corriente',
      alias: 'Cuenta Principal',
      number: faker.finance.accountNumber(),
      cci: faker.string.numeric(20),
      currency: Currency.PEN,
    },
  });

  // WALLETS
  await prisma.wallet.create({
    data: {
      companyId: empresa.id,
      type: WalletType.YAPE,
      phone: faker.phone.number(),
      qrUrl: faker.internet.url(),
    },
  });

  await prisma.wallet.create({
    data: {
      companyId: empresa.id,
      type: WalletType.PLIN,
      phone: faker.phone.number(),
    },
  });

  // USUARIOS
  const usuario = await prisma.user.create({
    data: {
      companyId: empresa.id,
      name: 'Juan Pérez',
      username: 'admin',
      email: 'admin@vidrieriademo.com',
      password: 'password123', // En producción usar hash
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Crear usuario vendedor
  const vendedor = await prisma.user.create({
    data: {
      companyId: empresa.id,
      name: 'María García',
      username: 'vendedor1',
      email: 'maria@vidrieriademo.com',
      password: 'password123',
      role: UserRole.OPERATOR,
      isActive: true,
    },
  });

  // CLIENTES
  const clientesData = [
    { name: 'Carlos Mendoza', doc: '12345678', type: DocumentType.DNI, email: 'carlos@email.com' },
    { name: 'Ana Torres', doc: '87654321', type: DocumentType.DNI, email: 'ana@email.com' },
    { name: 'Empresa ABC SAC', doc: '20123456789', type: DocumentType.RUC, email: 'contacto@abc.com' },
    { name: 'Pedro Ramírez', doc: '11223344', type: DocumentType.DNI, email: 'pedro@email.com' },
    { name: 'Construcciones XYZ', doc: '20987654321', type: DocumentType.RUC, email: 'ventas@xyz.com' },
    { name: 'Rosa Jiménez', doc: '55667788', type: DocumentType.DNI, email: 'rosa@email.com' },
    { name: 'Decoraciones Elite', doc: '20456789123', type: DocumentType.RUC, email: 'info@elite.com' },
    { name: 'Luis Vargas', doc: '99887766', type: DocumentType.DNI, email: 'luis@email.com' },
  ];

  const createdClients = [];
  for (const clientData of clientesData) {
    const client = await prisma.client.create({
      data: {
        companyId: empresa.id,
        documentType: clientData.type,
        documentNumber: clientData.doc,
        fullName: clientData.name,
        businessName: clientData.type === DocumentType.RUC ? clientData.name : undefined,
        email: clientData.email,
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),

      },
    });
    createdClients.push(client);
  }

  // COTIZACIONES
  const cotizacionesData = [
    { clientIndex: 0, status: QuoteStatus.PENDING, code: 'COT-2024-001' },
    { clientIndex: 1, status: QuoteStatus.ACCEPTED, code: 'COT-2024-002' },
    { clientIndex: 2, status: QuoteStatus.PENDING, code: 'COT-2024-003' },
    { clientIndex: 3, status: QuoteStatus.REJECTED, code: 'COT-2024-004' },
    { clientIndex: 4, status: QuoteStatus.ACCEPTED, code: 'COT-2024-005' },
    { clientIndex: 5, status: QuoteStatus.PENDING, code: 'COT-2024-006' },
  ];

  for (const cotData of cotizacionesData) {
    const quote = await prisma.quote.create({
      data: {
        companyId: empresa.id,
        code: cotData.code,
        clientId: createdClients[cotData.clientIndex].id,
        status: cotData.status,


        notes: faker.lorem.sentence(),
        createdById: usuario.id,
      },
    });

    // ITEMS DE COTIZACIÓN (2-4 items por cotización)
    const numItems = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numItems; i++) {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = faker.number.float({ min: 15, max: 500, fractionDigits: 2 });
      const subtotal = quantity * unitPrice;
      
      await prisma.quoteItem.create({
        data: {
          quoteId: quote.id,
          description: `${faker.commerce.productName()} - Item ${i + 1}`,
          unit: 'PZA',
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: subtotal,
        },
      });
    }
  }

  console.log(`→ Datos operacionales creados para ${empresa.name}`);
  console.log('   - 1 Sucursal');
  console.log('   - 1 Cuenta bancaria');
  console.log('   - 2 Wallets (YAPE/PLIN)');
  console.log('   - 2 Usuarios (Admin/Vendedor)');
  console.log(`   - ${createdClients.length} Clientes`);
  console.log(`   - ${cotizacionesData.length} Cotizaciones con items`);
  console.log('🎉 Seed completo finalizado correctamente.');
}

main()
  .catch((err) => {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
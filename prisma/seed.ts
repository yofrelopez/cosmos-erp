import { PrismaClient, QuoteStatus, DocumentType, WalletType, Currency } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/es';

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 Borrando datos existentes...');
  await prisma.observation.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.client.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Insertando empresas con datos completos...');

  for (let i = 0; i < 3; i++) {
    const empresa = await prisma.company.create({
      data: {
        name: faker.company.name(),
        ruc: faker.string.numeric(11),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
        whatsapp: faker.phone.number(),
        email: faker.internet.email(),
        facebookUrl: faker.internet.url(),
        instagramUrl: faker.internet.url(),
        tiktokUrl: faker.internet.url(),
        slogan: faker.company.catchPhrase(),
        description: faker.lorem.sentence(),
        legalRepresentative: faker.person.fullName(),
        administrator: faker.person.fullName(),
      },
    });

    console.log(`→ Empresa: ${empresa.name}`);

    // Cuenta bancaria
    await prisma.bankAccount.create({
      data: {
        bank: 'BCP',
        accountType: 'Corriente',
        alias: 'Cuenta principal',
        number: `191-${faker.string.numeric(8)}-${faker.string.numeric(2)}`,
        cci: faker.string.numeric(20),
        currency: Currency.PEN,
        companyId: empresa.id,
      },
    });

    // Wallet
    await prisma.wallet.create({
      data: {
        type: WalletType.YAPE,
        phone: faker.phone.number(),
        companyId: empresa.id,
      },
    });

    // Crear 15 clientes
    const clientes = [];
    for (let j = 0; j < 15; j++) {
      const cliente = await prisma.client.create({
        data: {
          fullName: faker.person.fullName(),
          documentType: DocumentType.DNI,
          documentNumber: faker.string.numeric(8),
          phone: faker.phone.number(),
          email: faker.internet.email(),
          address: faker.location.streetAddress(),
          companyId: empresa.id,
        },
      });
      clientes.push(cliente);
    }

    // Crear 15 cotizaciones con ítems para los primeros 15 clientes
    for (let k = 0; k < 15; k++) {
      const cliente = clientes[k];
      const items = [];
      let total = 0;

      for (let m = 0; m < faker.number.int({ min: 2, max: 4 }); m++) {
        const quantity = faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
        const unitPrice = faker.number.float({ min: 50, max: 300, fractionDigits: 2 });
        const subtotal = parseFloat((quantity * unitPrice).toFixed(2));
        total += subtotal;

        items.push({
          description: faker.commerce.productName(),
          unit: 'unidad',
          quantity,
          unitPrice,
          subtotal,
        });
      }

      const code = `COT-25-E${empresa.id}-${String(k + 1).padStart(4, '0')}`;

      await prisma.quote.create({
        data: {
          code,
          clientId: cliente.id,
          companyId: empresa.id,
          status: QuoteStatus.PENDING,
          notes: faker.lorem.sentence(),
          total: parseFloat(total.toFixed(2)),
          items: {
            create: items,
          },
          observations: {
            create: [
              {
                type: 'estado',
                message: 'Cotización generada automáticamente.',
              },
            ],
          },
        },
      });
    }

    console.log(`→ ${clientes.length} clientes y 15 cotizaciones creadas para ${empresa.name}`);
  }

  console.log('🎉 Seed finalizado correctamente.');
}

main()
  .catch((err) => {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 Borrando datos existentes...');
  
  // Limpiar tablas de precios
  await prisma.pricingThickness.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Creando catálogos globales...');
  
  // =========================
  // ESPESORES (catálogo global único)
  // =========================
  const thicknessNames = [
    'MEDIA',
    'TRES_CUARTOS', 
    'UNA_PULGADA',
    'UNA_Y_CUARTO',
    'UNA_Y_MEDIA',
    'DOS_PULGADAS',
    'MEDIA_X_MEDIA',
    'MEDIA_X_TRES_CUARTOS',
    'MEDIA_X_UNA_PULGADA',
  ];
  
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

  for (const name of thicknessNames) {
    await prisma.pricingThickness.create({
      data: {
        name,
        companyId: empresa.id,
      },
    });
  }
  
  console.log('✅ Espesores insertados correctamente.');
  console.log('🎉 Seed básico finalizado correctamente.');
}

main()
  .catch((err) => {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
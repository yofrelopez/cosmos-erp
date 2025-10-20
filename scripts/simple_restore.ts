import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Restaurando desde backup...');
  
  const backupData = JSON.parse(fs.readFileSync('backup-real-data-2025-10-18T15-52-13-277Z.json', 'utf8'));
  
  // Crear empresa
  const empresa = await prisma.company.create({
    data: backupData.companies[0]
  });
  console.log('✅ Empresa restaurada');
  
  // Crear usuario admin
  const admin = await prisma.user.create({
    data: backupData.users[0]
  });
  console.log('✅ Usuario admin restaurado');
  
  console.log('🎉 Datos básicos restaurados exitosamente!');
  console.log('👤 Usuario: admin@vdcosmos.com');
  console.log('🔑 Contraseña: admin50cosmos');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
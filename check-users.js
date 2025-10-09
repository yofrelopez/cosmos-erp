// check-users.js
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👥 Verificando usuarios en la base de datos...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isActive: true
      }
    });
    
    console.log(`📊 Total usuarios encontrados: ${users.length}`);
    
    users.forEach(user => {
      const passPreview = user.password.length > 20 ? `${user.password.substring(0, 20)}...` : user.password;
      console.log(`- ${user.email} / ${user.username} / ${user.role} / Activo: ${user.isActive}`);
      console.log(`  Password: ${passPreview}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
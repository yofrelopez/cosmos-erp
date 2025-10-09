// fix-passwords.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Hasheando passwords en texto plano...');
    
    const users = await prisma.user.findMany({
      where: {
        // Passwords que no empiecen con $2b$ (no están hasheadas)
        password: {
          not: {
            startsWith: '$2b$'
          }
        }
      }
    });
    
    console.log(`📊 Usuarios con password en texto plano: ${users.length}`);
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      console.log(`✅ Password hasheada para: ${user.email}`);
    }
    
    console.log('🎉 ¡Todas las passwords han sido hasheadas!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswords();
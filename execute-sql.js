// Script para ejecutar el SQL generado en Supabase
const { Client } = require('pg');
const fs = require('fs');

const SUPABASE_DB = {
  connectionString: 'postgresql://postgres.livfkgybcufjshwkymdm:passDatamjku765Ds@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
};

async function executeSQLFile() {
  const client = new Client(SUPABASE_DB);
  
  try {
    console.log('🔄 Conectando a Supabase...');
    await client.connect();
    
    console.log('📋 Leyendo archivo SQL...');
    const sqlContent = fs.readFileSync('clone-database.sql', 'utf8');
    
    // Dividir en comandos individuales (por punto y coma)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));
    
    console.log(`📋 Encontrados ${commands.length} comandos SQL`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.length < 10) continue; // Skip very short commands
      
      try {
        console.log(`⏳ Ejecutando comando ${i + 1}/${commands.length}`);
        await client.query(command);
        successCount++;
        
        // Mostrar progreso cada 10 comandos
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Progreso: ${i + 1}/${commands.length} comandos ejecutados`);
        }
        
      } catch (error) {
        errorCount++;
        console.log(`❌ Error en comando ${i + 1}: ${error.message.substring(0, 100)}...`);
        
        // Mostrar el comando que falló (primeros 100 caracteres)
        console.log(`   Comando: ${command.substring(0, 100)}...`);
        
        // Si hay muchos errores, parar
        if (errorCount > 20) {
          console.log('🛑 Demasiados errores, deteniendo...');
          break;
        }
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`✅ Comandos exitosos: ${successCount}`);
    console.log(`❌ Comandos con error: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 ¡Migración completada exitosamente!');
    } else {
      console.log('⚠️  Migración completada con algunos errores');
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await client.end();
  }
}

executeSQLFile();
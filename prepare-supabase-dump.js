// Script para limpiar el dump de PostgreSQL y adaptarlo a Supabase
const fs = require('fs');

function cleanDumpForSupabase() {
  console.log('🔄 Limpiando dump de PostgreSQL para Supabase...');
  
  // Leer el archivo original
  let content = fs.readFileSync('clone-database.sql', 'utf8');
  
  console.log('📋 Archivo original: ' + Math.round(content.length / 1024) + 'KB');
  
  // Limpiezas necesarias para Supabase
  console.log('🧹 Aplicando limpiezas...');
  
  // 1. Remover comandos problemáticos
  content = content.replace(/\\restrict.*$/gm, '');
  content = content.replace(/DROP DATABASE.*$/gm, '');
  content = content.replace(/CREATE DATABASE.*$/gm, '');
  content = content.replace(/\\connect.*$/gm, '');
  
  // 2. Remover configuraciones que Supabase no permite
  content = content.replace(/SET row_security = off;/g, '-- SET row_security = off; -- Comentado para Supabase');
  content = content.replace(/SELECT pg_catalog\.set_config\('search_path'.*$/gm, '-- Comentado para Supabase');
  
  // 3. Remover ACL y privilegios
  content = content.replace(/GRANT.*$/gm, '-- GRANT comentado');
  content = content.replace(/REVOKE.*$/gm, '-- REVOKE comentado');
  
  // 4. Remover comentarios de sistema
  content = content.replace(/-- Dumped from database version.*$/gm, '');
  content = content.replace(/-- Dumped by pg_dump version.*$/gm, '');
  
  // 5. Agregar header para Supabase
  const header = `-- ============================================
-- CLONE EXACTO DE BASE DE DATOS LOCAL
-- ERP VD COSMOS -> SUPABASE
-- 
-- Este es un dump real de PostgreSQL limpio
-- para ser ejecutado en Supabase
-- ============================================

`;

  content = header + content;
  
  // 6. Guardar archivo limpio
  const cleanFilename = 'aplicar-migraciones-supabase.sql';
  fs.writeFileSync(cleanFilename, content, 'utf8');
  
  console.log('✅ Archivo limpio generado: ' + cleanFilename);
  console.log('📊 Tamaño final: ' + Math.round(content.length / 1024) + 'KB');
  
  console.log('\n📋 INSTRUCCIONES PARA APLICAR:');
  console.log('1. Ve a https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto: erp-vdcosmos');
  console.log('3. Ve a "SQL Editor"');
  console.log('4. Abre el archivo: ' + cleanFilename);
  console.log('5. Copia TODO el contenido');
  console.log('6. Pégalo en el SQL Editor');
  console.log('7. Ejecuta (puede tomar 1-2 minutos)');
  console.log('8. ¡Tendrás tu base de datos EXACTA en Supabase!');
}

cleanDumpForSupabase();
-- Consulta para verificar qué tablas existen en Supabase
-- Ejecutar primero esta consulta en Supabase SQL Editor

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
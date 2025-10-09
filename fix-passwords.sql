-- fix-passwords.sql
-- Actualizar passwords en texto plano a bcrypt hash

-- Para admin@vidrieriademo.com (password: password123)
UPDATE "users" 
SET password = '$2b$12$gdbT4XcVNNA9MydO6j5E7.ykQ/ghH8Kx8yCBynqM/igrACBzFVjtW'
WHERE email = 'admin@vidrieriademo.com';

-- Para maria@vidrieriademo.com (password: password123)  
UPDATE "users" 
SET password = '$2b$12$gdbT4XcVNNA9MydO6j5E7.ykQ/ghH8Kx8yCBynqM/igrACBzFVjtW'
WHERE email = 'maria@vidrieriademo.com';

-- Verificar cambios
SELECT email, username, role, 
       CASE 
         WHEN password LIKE '$2b$%' THEN 'Hasheada ✅'
         ELSE 'Texto plano ❌'
       END as password_status
FROM "users"
ORDER BY email;
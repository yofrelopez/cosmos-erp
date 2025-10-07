-- Seed completo para tablas de vidrios y cálculos
-- Usar con companyId = 1 (ajustar según necesario)

-- 1. COLORES DE VIDRIO (Catálogo global)
INSERT INTO colors (name, created_at, updated_at)
VALUES 
  ('Transparente', NOW(), NOW()),
  ('Verde', NOW(), NOW()),
  ('Azul', NOW(), NOW()),
  ('Gris', NOW(), NOW()),
  ('Bronce', NOW(), NOW()),
  ('Negro', NOW(), NOW()),
  ('Dorado', NOW(), NOW()),
  ('Plata', NOW(), NOW()),
  ('Café', NOW(), NOW()),
  ('Rojo', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. TEXTURAS (Catálogo global)
INSERT INTO textures (name, created_at, updated_at)
VALUES 
  ('Liso', NOW(), NOW()),
  ('Cuadriculado', NOW(), NOW()),
  ('Llovizna', NOW(), NOW()),
  ('Garatachi', NOW(), NOW()),
  ('Flora', NOW(), NOW()),
  ('Marihuana', NOW(), NOW()),
  ('Ramas', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. PRECIOS DE VIDRIOS para companyId = 1
-- IMPORTANTE: Ajustar companyId según tu empresa activa

-- 3.1 VIDRIOS PLANOS (Cristal normal)
INSERT INTO pricing_glass (
  company_id, commercial_name, family, thickness_mm, color_type, color_id, price, 
  valid_from, is_active, created_at, updated_at
)
VALUES 
  -- 2mm (para cuadros)
  (1, 'Cristal Plano 2mm', 'PLANO', 2.00, 'INCOLORO', NULL, 8.50, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Verde 2mm', 'PLANO', 2.00, 'COLOR', 2, 9.80, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Azul 2mm', 'PLANO', 2.00, 'COLOR', 3, 9.80, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Gris 2mm', 'PLANO', 2.00, 'COLOR', 4, 9.80, NOW(), true, NOW(), NOW()),
  
  -- 3mm 
  (1, 'Cristal Plano 3mm', 'PLANO', 3.00, 'INCOLORO', NULL, 10.50, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Verde 3mm', 'PLANO', 3.00, 'COLOR', 2, 12.20, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Azul 3mm', 'PLANO', 3.00, 'COLOR', 3, 12.20, NOW(), true, NOW(), NOW()),
  
  -- 4mm
  (1, 'Cristal Plano 4mm', 'PLANO', 4.00, 'INCOLORO', NULL, 12.80, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Verde 4mm', 'PLANO', 4.00, 'COLOR', 2, 14.50, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Bronce 4mm', 'PLANO', 4.00, 'COLOR', 5, 14.50, NOW(), true, NOW(), NOW()),
  
  -- 5mm
  (1, 'Cristal Plano 5mm', 'PLANO', 5.00, 'INCOLORO', NULL, 15.20, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Verde 5mm', 'PLANO', 5.00, 'COLOR', 2, 17.80, NOW(), true, NOW(), NOW()),
  
  -- 6mm
  (1, 'Cristal Plano 6mm', 'PLANO', 6.00, 'INCOLORO', NULL, 18.50, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Verde 6mm', 'PLANO', 6.00, 'COLOR', 2, 21.20, NOW(), true, NOW(), NOW()),
  (1, 'Cristal Gris 6mm', 'PLANO', 6.00, 'COLOR', 4, 21.20, NOW(), true, NOW(), NOW())
ON CONFLICT (company_id, commercial_name, family, thickness_mm, valid_from) DO NOTHING;

-- 3.2 VIDRIOS CATEDRAL (Texturizados)
INSERT INTO pricing_glass (
  company_id, commercial_name, family, thickness_mm, color_type, color_id, price, 
  valid_from, is_active, created_at, updated_at
)
VALUES 
  -- 2mm Catedral (para cuadros)
  (1, 'Catedral Llovizna 2mm', 'CATEDRAL', 2.00, 'INCOLORO', NULL, 9.50, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Cuadriculado 2mm', 'CATEDRAL', 2.00, 'INCOLORO', NULL, 9.50, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Flora 2mm', 'CATEDRAL', 2.00, 'INCOLORO', NULL, 10.20, NOW(), true, NOW(), NOW()),
  
  -- 3mm Catedral
  (1, 'Catedral Llovizna 3mm', 'CATEDRAL', 3.00, 'INCOLORO', NULL, 11.80, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Cuadriculado 3mm', 'CATEDRAL', 3.00, 'INCOLORO', NULL, 11.80, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Flora 3mm', 'CATEDRAL', 3.00, 'INCOLORO', NULL, 12.50, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Garatachi 3mm', 'CATEDRAL', 3.00, 'INCOLORO', NULL, 12.50, NOW(), true, NOW(), NOW()),
  
  -- 4mm Catedral
  (1, 'Catedral Llovizna 4mm', 'CATEDRAL', 4.00, 'INCOLORO', NULL, 14.20, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Flora 4mm', 'CATEDRAL', 4.00, 'INCOLORO', NULL, 15.80, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Ramas 4mm', 'CATEDRAL', 4.00, 'INCOLORO', NULL, 15.80, NOW(), true, NOW(), NOW()),
  
  -- 5mm Catedral
  (1, 'Catedral Llovizna 5mm', 'CATEDRAL', 5.00, 'INCOLORO', NULL, 16.50, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Flora 5mm', 'CATEDRAL', 5.00, 'INCOLORO', NULL, 18.20, NOW(), true, NOW(), NOW()),
  
  -- 6mm Catedral
  (1, 'Catedral Llovizna 6mm', 'CATEDRAL', 6.00, 'INCOLORO', NULL, 19.80, NOW(), true, NOW(), NOW()),
  (1, 'Catedral Flora 6mm', 'CATEDRAL', 6.00, 'INCOLORO', NULL, 22.50, NOW(), true, NOW(), NOW())
ON CONFLICT (company_id, commercial_name, family, thickness_mm, valid_from) DO NOTHING;

-- 3.3 VIDRIOS TEMPLADOS (Premium)
INSERT INTO pricing_glass (
  company_id, commercial_name, family, thickness_mm, color_type, color_id, price, 
  valid_from, is_active, created_at, updated_at
)
VALUES 
  -- 4mm Templado
  (1, 'Templado Incoloro 4mm', 'TEMPLADO', 4.00, 'INCOLORO', NULL, 25.80, NOW(), true, NOW(), NOW()),
  (1, 'Templado Verde 4mm', 'TEMPLADO', 4.00, 'COLOR', 2, 28.50, NOW(), true, NOW(), NOW()),
  
  -- 5mm Templado  
  (1, 'Templado Incoloro 5mm', 'TEMPLADO', 5.00, 'INCOLORO', NULL, 28.20, NOW(), true, NOW(), NOW()),
  (1, 'Templado Verde 5mm', 'TEMPLADO', 5.00, 'COLOR', 2, 32.80, NOW(), true, NOW(), NOW()),
  (1, 'Templado Azul 5mm', 'TEMPLADO', 5.00, 'COLOR', 3, 32.80, NOW(), true, NOW(), NOW()),
  
  -- 6mm Templado
  (1, 'Templado Incoloro 6mm', 'TEMPLADO', 6.00, 'INCOLORO', NULL, 32.50, NOW(), true, NOW(), NOW()),
  (1, 'Templado Verde 6mm', 'TEMPLADO', 6.00, 'COLOR', 2, 38.20, NOW(), true, NOW(), NOW()),
  (1, 'Templado Gris 6mm', 'TEMPLADO', 6.00, 'COLOR', 4, 38.20, NOW(), true, NOW(), NOW()),
  
  -- 8mm Templado
  (1, 'Templado Incoloro 8mm', 'TEMPLADO', 8.00, 'INCOLORO', NULL, 42.80, NOW(), true, NOW(), NOW()),
  (1, 'Templado Verde 8mm', 'TEMPLADO', 8.00, 'COLOR', 2, 48.50, NOW(), true, NOW(), NOW()),
  
  -- 10mm Templado
  (1, 'Templado Incoloro 10mm', 'TEMPLADO', 10.00, 'INCOLORO', NULL, 55.20, NOW(), true, NOW(), NOW()),
  (1, 'Templado Verde 10mm', 'TEMPLADO', 10.00, 'COLOR', 2, 62.80, NOW(), true, NOW(), NOW())
ON CONFLICT (company_id, commercial_name, family, thickness_mm, valid_from) DO NOTHING;

-- 3.4 ESPEJOS
INSERT INTO pricing_glass (
  company_id, commercial_name, family, thickness_mm, color_type, color_id, price, 
  valid_from, is_active, created_at, updated_at
)
VALUES 
  -- 3mm Espejo
  (1, 'Espejo Plata 3mm', 'ESPEJO', 3.00, 'REFLEJANTE', 8, 15.50, NOW(), true, NOW(), NOW()),
  (1, 'Espejo Bronce 3mm', 'ESPEJO', 3.00, 'REFLEJANTE', 5, 16.80, NOW(), true, NOW(), NOW()),
  
  -- 4mm Espejo
  (1, 'Espejo Plata 4mm', 'ESPEJO', 4.00, 'REFLEJANTE', 8, 18.20, NOW(), true, NOW(), NOW()),
  (1, 'Espejo Bronce 4mm', 'ESPEJO', 4.00, 'REFLEJANTE', 5, 19.80, NOW(), true, NOW(), NOW()),
  (1, 'Espejo Gris 4mm', 'ESPEJO', 4.00, 'REFLEJANTE', 4, 19.80, NOW(), true, NOW(), NOW()),
  
  -- 5mm Espejo
  (1, 'Espejo Plata 5mm', 'ESPEJO', 5.00, 'REFLEJANTE', 8, 22.50, NOW(), true, NOW(), NOW()),
  (1, 'Espejo Bronce 5mm', 'ESPEJO', 5.00, 'REFLEJANTE', 5, 24.80, NOW(), true, NOW(), NOW()),
  
  -- 6mm Espejo
  (1, 'Espejo Plata 6mm', 'ESPEJO', 6.00, 'REFLEJANTE', 8, 26.50, NOW(), true, NOW(), NOW()),
  (1, 'Espejo Bronce 6mm', 'ESPEJO', 6.00, 'REFLEJANTE', 5, 28.20, NOW(), true, NOW(), NOW())
ON CONFLICT (company_id, commercial_name, family, thickness_mm, valid_from) DO NOTHING;

-- 4. DATOS PARA MOLDURAS (si no existen)
-- Nota: Ajustar precios según tu mercado local

INSERT INTO pricing_moldings (
  company_id, name, quality, thickness_id, price_per_m, 
  valid_from, is_active, created_at, updated_at
)
SELECT 
  1 as company_id,
  name,
  quality,
  thickness_id,
  price_per_m,
  NOW() as valid_from,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM (VALUES 
  -- Molduras SIMPLE
  ('Moldura Simple Básica', 'SIMPLE', 1, 2.50),
  ('Moldura Simple Económica', 'SIMPLE', 1, 3.20),
  ('Moldura Simple Plus', 'SIMPLE', 2, 4.80),
  
  -- Molduras FINA
  ('Moldura Fina Clásica', 'FINA', 2, 8.50),
  ('Moldura Fina Elegante', 'FINA', 3, 12.20),
  ('Moldura Fina Premium', 'FINA', 3, 15.80),
  
  -- Molduras BASTIDOR
  ('Bastidor Simple', 'BASTIDOR', 1, 6.20),
  ('Bastidor Reforzado', 'BASTIDOR', 2, 8.80),
  ('Bastidor Premium', 'BASTIDOR', 3, 12.50)
) AS moldings(name, quality, thickness_id, price_per_m)
WHERE EXISTS (SELECT 1 FROM pricing_thickness WHERE id = thickness_id AND company_id = 1)
ON CONFLICT DO NOTHING;
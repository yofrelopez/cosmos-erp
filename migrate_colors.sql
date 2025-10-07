-- Migración de datos de colores
-- 1. Crear tabla de colores y sembrar datos básicos
INSERT INTO colors (name, "createdAt", "updatedAt") VALUES 
  ('Gris', NOW(), NOW()),
  ('Ámbar', NOW(), NOW()),
  ('Azul', NOW(), NOW()),
  ('Verde', NOW(), NOW()),
  ('Bronce', NOW(), NOW()),
  ('Humo', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2. Migrar datos existentes de color a colorType y oldColor
UPDATE pricing_glass 
SET 
  "colorType" = CASE 
    WHEN color = 'INCOLORO' THEN 'INCOLORO'::text
    ELSE 'COLOR'::text
  END,
  "oldColor" = color
WHERE "colorType" IS NULL OR "colorType" = 'INCOLORO';

-- 3. Asignar colorId para colores específicos
UPDATE pricing_glass 
SET "colorId" = (
  SELECT c.id FROM colors c 
  WHERE LOWER(c.name) = CASE 
    WHEN pricing_glass.color = 'GRIS' THEN 'gris'
    WHEN pricing_glass.color = 'AMBAR' THEN 'ámbar'  
    WHEN pricing_glass.color = 'AZUL' THEN 'azul'
    ELSE NULL
  END
  LIMIT 1
)
WHERE pricing_glass.color IN ('GRIS', 'AMBAR', 'AZUL');
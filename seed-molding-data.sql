-- Query to check existing companies and seed molding catalog data

-- First, let's see available companies
SELECT id, name FROM companies ORDER BY id;

-- Then, replace {company_id} with the desired company ID and run:

-- For company ID 1 (replace with actual company ID):
INSERT INTO molding_textures (company_id, name, created_at, updated_at) 
VALUES 
  (1, 'Lisa', NOW(), NOW()),
  (1, 'Rugosa', NOW(), NOW()),
  (1, 'Mate', NOW(), NOW()),
  (1, 'Brillante', NOW(), NOW()),
  (1, 'Satinada', NOW(), NOW()),
  (1, 'Texturizada', NOW(), NOW()),
  (1, 'Rayada', NOW(), NOW()),
  (1, 'Punteada', NOW(), NOW())
ON CONFLICT (company_id, name) DO NOTHING;

INSERT INTO molding_colors (company_id, name, created_at, updated_at)
VALUES
  (1, 'Blanco', NOW(), NOW()),
  (1, 'Negro', NOW(), NOW()),
  (1, 'Dorado', NOW(), NOW()),
  (1, 'Plata', NOW(), NOW()),
  (1, 'Café', NOW(), NOW()),
  (1, 'Bronce', NOW(), NOW()),
  (1, 'Cobre', NOW(), NOW()),
  (1, 'Gris', NOW(), NOW()),
  (1, 'Crema', NOW(), NOW()),
  (1, 'Beige', NOW(), NOW()),
  (1, 'Marfil', NOW(), NOW()),
  (1, 'Natural', NOW(), NOW())
ON CONFLICT (company_id, name) DO NOTHING;
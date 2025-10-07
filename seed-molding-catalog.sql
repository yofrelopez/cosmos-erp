-- Seed data for molding textures and colors
-- Replace {company_id} with actual company ID

-- Insert sample textures for molduras
INSERT INTO molding_textures (company_id, name, created_at, updated_at) 
VALUES 
  ({company_id}, 'Lisa', NOW(), NOW()),
  ({company_id}, 'Rugosa', NOW(), NOW()),
  ({company_id}, 'Mate', NOW(), NOW()),
  ({company_id}, 'Brillante', NOW(), NOW()),
  ({company_id}, 'Satinada', NOW(), NOW()),
  ({company_id}, 'Texturizada', NOW(), NOW()),
  ({company_id}, 'Rayada', NOW(), NOW()),
  ({company_id}, 'Punteada', NOW(), NOW())
ON CONFLICT (company_id, name) DO NOTHING;

-- Insert sample colors for molduras  
INSERT INTO molding_colors (company_id, name, created_at, updated_at)
VALUES
  ({company_id}, 'Blanco', NOW(), NOW()),
  ({company_id}, 'Negro', NOW(), NOW()),
  ({company_id}, 'Dorado', NOW(), NOW()),
  ({company_id}, 'Plata', NOW(), NOW()),
  ({company_id}, 'Café', NOW(), NOW()),
  ({company_id}, 'Bronce', NOW(), NOW()),
  ({company_id}, 'Cobre', NOW(), NOW()),
  ({company_id}, 'Gris', NOW(), NOW()),
  ({company_id}, 'Crema', NOW(), NOW()),
  ({company_id}, 'Beige', NOW(), NOW()),
  ({company_id}, 'Marfil', NOW(), NOW()),
  ({company_id}, 'Natural', NOW(), NOW())
ON CONFLICT (company_id, name) DO NOTHING;
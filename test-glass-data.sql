-- Datos de prueba para PricingGlass
-- Insertar algunos vidrios de prueba

INSERT INTO pricing_glass (
    "companyId",
    "commercialName",
    family,
    "thicknessMM",
    "colorType",
    price,
    "isActive",
    "validFrom"
) VALUES 
-- Vidrios PLANO
(1, 'Cristal Simple 4mm', 'PLANO', 4.00, 'INCOLORO', 25.50, true, NOW()),
(1, 'Cristal Simple 6mm', 'PLANO', 6.00, 'INCOLORO', 35.75, true, NOW()),
(1, 'Cristal Simple 8mm', 'PLANO', 8.00, 'INCOLORO', 45.25, true, NOW()),

-- Vidrios TEMPLADO
(1, 'Templado 6mm', 'TEMPLADO', 6.00, 'INCOLORO', 65.00, true, NOW()),
(1, 'Templado 8mm', 'TEMPLADO', 8.00, 'INCOLORO', 85.50, true, NOW()),
(1, 'Templado 10mm', 'TEMPLADO', 10.00, 'INCOLORO', 105.25, true, NOW()),

-- Vidrios CATEDRAL
(1, 'Catedral Mate 4mm', 'CATEDRAL', 4.00, 'INCOLORO', 42.00, true, NOW()),
(1, 'Catedral Mate 6mm', 'CATEDRAL', 6.00, 'INCOLORO', 52.50, true, NOW()),

-- Vidrios ESPEJO
(1, 'Espejo 4mm', 'ESPEJO', 4.00, 'COLOR', 48.75, true, NOW()),
(1, 'Espejo 6mm', 'ESPEJO', 6.00, 'COLOR', 58.25, true, NOW()),

-- Vidrios con colores específicos
(1, 'Cristal Azul 6mm', 'PLANO', 6.00, 'COLOR', 45.00, true, NOW()),
(1, 'Cristal Verde 6mm', 'PLANO', 6.00, 'COLOR', 45.00, true, NOW()),
(1, 'Templado Bronce 8mm', 'TEMPLADO', 8.00, 'COLOR', 95.50, true, NOW());
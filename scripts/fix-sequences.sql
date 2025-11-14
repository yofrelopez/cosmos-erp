-- Script para resetear todas las secuencias de autoincremento
-- Ajusta cada secuencia al siguiente ID disponible basado en MAX(id) de cada tabla
-- Este script es seguro y se puede ejecutar múltiples veces

-- Resetear secuencias de tablas con datos importados
SELECT setval('"Company_id_seq"', COALESCE((SELECT MAX(id) FROM "Company"), 0) + 1, false);
SELECT setval('"User_id_seq"', COALESCE((SELECT MAX(id) FROM "User"), 0) + 1, false);
SELECT setval('colors_id_seq', COALESCE((SELECT MAX(id) FROM colors), 0) + 1, false);
SELECT setval('textures_id_seq', COALESCE((SELECT MAX(id) FROM textures), 0) + 1, false);
SELECT setval('"Client_id_seq"', COALESCE((SELECT MAX(id) FROM "Client"), 0) + 1, false);
SELECT setval('"Quote_id_seq"', COALESCE((SELECT MAX(id) FROM "Quote"), 0) + 1, false);
SELECT setval('"QuoteItem_id_seq"', COALESCE((SELECT MAX(id) FROM "QuoteItem"), 0) + 1, false);
SELECT setval('"QuoteItemImage_id_seq"', COALESCE((SELECT MAX(id) FROM "QuoteItemImage"), 0) + 1, false);
SELECT setval('"Observation_id_seq"', COALESCE((SELECT MAX(id) FROM "Observation"), 0) + 1, false);
SELECT setval('"BankAccount_id_seq"', COALESCE((SELECT MAX(id) FROM "BankAccount"), 0) + 1, false);
SELECT setval('"Wallet_id_seq"', COALESCE((SELECT MAX(id) FROM "Wallet"), 0) + 1, false);
SELECT setval('"Contract_id_seq"', COALESCE((SELECT MAX(id) FROM "Contract"), 0) + 1, false);
SELECT setval('"ContractItem_id_seq"', COALESCE((SELECT MAX(id) FROM "ContractItem"), 0) + 1, false);
SELECT setval('"ContractItemImage_id_seq"', COALESCE((SELECT MAX(id) FROM "ContractItemImage"), 0) + 1, false);
SELECT setval('"Payment_id_seq"', COALESCE((SELECT MAX(id) FROM "Payment"), 0) + 1, false);
SELECT setval('"Branch_id_seq"', COALESCE((SELECT MAX(id) FROM "Branch"), 0) + 1, false);

-- Resetear secuencias de tablas de pricing y catálogos
SELECT setval('molding_colors_id_seq', COALESCE((SELECT MAX(id) FROM molding_colors), 0) + 1, false);
SELECT setval('molding_textures_id_seq', COALESCE((SELECT MAX(id) FROM molding_textures), 0) + 1, false);
SELECT setval('pricing_accessory_id_seq', COALESCE((SELECT MAX(id) FROM pricing_accessory), 0) + 1, false);
SELECT setval('pricing_backing_id_seq', COALESCE((SELECT MAX(id) FROM pricing_backing), 0) + 1, false);
SELECT setval('pricing_frame_preset_id_seq', COALESCE((SELECT MAX(id) FROM pricing_frame_preset), 0) + 1, false);
SELECT setval('pricing_glass_id_seq', COALESCE((SELECT MAX(id) FROM pricing_glass), 0) + 1, false);
SELECT setval('pricing_matboard_id_seq', COALESCE((SELECT MAX(id) FROM pricing_matboard), 0) + 1, false);
SELECT setval('pricing_molding_id_seq', COALESCE((SELECT MAX(id) FROM pricing_molding), 0) + 1, false);
SELECT setval('pricing_thickness_id_seq', COALESCE((SELECT MAX(id) FROM pricing_thickness), 0) + 1, false);

-- Mostrar resultado
SELECT 'Secuencias actualizadas correctamente' as status;

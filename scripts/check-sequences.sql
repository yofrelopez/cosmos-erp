-- Script para verificar el estado de las secuencias en todas las tablas
-- Compara el MAX(id) de cada tabla con el valor actual de su secuencia

-- Tablas principales
SELECT 'Company' as tabla, MAX(id) as max_id, 
  (SELECT last_value FROM "Company_id_seq") as seq_value
FROM "Company"
UNION ALL
SELECT 'User', MAX(id), (SELECT last_value FROM "User_id_seq") FROM "User"
UNION ALL
SELECT 'colors', MAX(id), (SELECT last_value FROM colors_id_seq) FROM colors
UNION ALL
SELECT 'textures', MAX(id), (SELECT last_value FROM textures_id_seq) FROM textures
UNION ALL
SELECT 'Client', MAX(id), (SELECT last_value FROM "Client_id_seq") FROM "Client"
UNION ALL
SELECT 'Quote', MAX(id), (SELECT last_value FROM "Quote_id_seq") FROM "Quote"
UNION ALL
SELECT 'QuoteItem', MAX(id), (SELECT last_value FROM "QuoteItem_id_seq") FROM "QuoteItem"
UNION ALL
SELECT 'BankAccount', MAX(id), (SELECT last_value FROM "BankAccount_id_seq") FROM "BankAccount"
UNION ALL
SELECT 'Wallet', MAX(id), (SELECT last_value FROM "Wallet_id_seq") FROM "Wallet"
UNION ALL
SELECT 'molding_colors', MAX(id), (SELECT last_value FROM molding_colors_id_seq) FROM molding_colors
UNION ALL
SELECT 'molding_textures', MAX(id), (SELECT last_value FROM molding_textures_id_seq) FROM molding_textures
UNION ALL
SELECT 'pricing_accessory', MAX(id), (SELECT last_value FROM pricing_accessory_id_seq) FROM pricing_accessory
UNION ALL
SELECT 'pricing_backing', MAX(id), (SELECT last_value FROM pricing_backing_id_seq) FROM pricing_backing
UNION ALL
SELECT 'pricing_glass', MAX(id), (SELECT last_value FROM pricing_glass_id_seq) FROM pricing_glass
UNION ALL
SELECT 'pricing_matboard', MAX(id), (SELECT last_value FROM pricing_matboard_id_seq) FROM pricing_matboard
UNION ALL
SELECT 'pricing_molding', MAX(id), (SELECT last_value FROM pricing_molding_id_seq) FROM pricing_molding
UNION ALL
SELECT 'pricing_thickness', MAX(id), (SELECT last_value FROM pricing_thickness_id_seq) FROM pricing_thickness
ORDER BY tabla;

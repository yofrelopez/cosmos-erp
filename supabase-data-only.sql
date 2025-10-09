-- ============================================
-- SOLO DATOS PARA SUPABASE - ERP VD COSMOS
-- 
-- Este archivo contiene SOLO los datos (no estructura)
-- Las tablas ya deben existir en Supabase
-- ============================================

-- ==========================================
-- Datos para tabla: Company
-- Registros: 1
-- ==========================================

TRUNCATE TABLE "Company" CASCADE;
INSERT INTO "Company" ("id", "name", "ruc", "logoUrl", "address", "phone", "whatsapp", "facebookUrl", "instagramUrl", "tiktokUrl", "email", "website", "slogan", "description", "notes", "legalRepresentative", "administrator", "createdAt", "updatedAt", "status") VALUES (1, 'V&D COSMOS S.R.L', '20609799090', 'https://res.cloudinary.com/dhf5lgjr6/image/upload/v1759877326/vd-cosmos/logos/empresa-1.png', 'Jr. Arequipa Nro. 230 - Barranca', '994 260 216', '998136 138', 'https://facebook.com/vidrieriademo', 'https://instagram.com/vidrieriademo', 'https://tiktok.com/@vidrieriademo', 'vidrieriacosmos@gmail.com', NULL, 'Calidad para tu vida', 'Acabados de aluminio, ventana, mamparas, cuadros, espejos, melamina y ferretería en general.', NULL, 'Carlos López', 'Matilde Sifuentes', '2025-10-07T21:31:42.911Z', '2025-10-08T04:25:20.695Z', 'ACTIVE');

-- ==========================================
-- Datos para tabla: BankAccount
-- Registros: 2
-- ==========================================

TRUNCATE TABLE "BankAccount" CASCADE;
INSERT INTO "BankAccount" ("id", "bank", "accountType", "alias", "number", "cci", "currency", "companyId") VALUES (2, 'INTERBANK', 'Cuenta Negocios Soles', 'Cuenta principal', '5233006591083', '00352300300659108385', 'PEN', 1);
INSERT INTO "BankAccount" ("id", "bank", "accountType", "alias", "number", "cci", "currency", "companyId") VALUES (3, 'Banco de la Nación', 'Cuenta de Detracciones', 'Detracción', '00 331 068462', '018 331 00033106846290', 'PEN', 1);

-- ==========================================
-- Datos para tabla: Branch
-- Registros: 1
-- ==========================================

TRUNCATE TABLE "Branch" CASCADE;
INSERT INTO "Branch" ("id", "name", "address", "phone", "status", "companyId") VALUES (1, 'Sucursal Principal', 'Rincón Ester s/n.', '919982016', 'ACTIVE', 1);

-- ==========================================
-- Datos para tabla: Wallet
-- Registros: 2
-- ==========================================

TRUNCATE TABLE "Wallet" CASCADE;
INSERT INTO "Wallet" ("id", "type", "phone", "qrUrl", "companyId") VALUES (1, 'YAPE', '994 260 216', 'https://precious-hydrocarbon.com.es/', 1);
INSERT INTO "Wallet" ("id", "type", "phone", "qrUrl", "companyId") VALUES (2, 'PLIN', '994 260 216', NULL, 1);

-- ==========================================
-- Datos para tabla: Client
-- Registros: 8
-- ==========================================

TRUNCATE TABLE "Client" CASCADE;
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (1, 'DNI', '12345678', 'Carlos Mendoza', NULL, NULL, '947-077-626', 'carlos@email.com', 'Rincón Antonia Alonzo 6', NULL, '2025-10-07T21:31:43.051Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (2, 'DNI', '87654321', 'Ana Torres', NULL, NULL, '970 347 147', 'ana@email.com', 'Ferrocarril Lucas s/n.', NULL, '2025-10-07T21:31:43.054Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (3, 'RUC', '20123456789', 'Empresa ABC SAC', NULL, 'Empresa ABC SAC', '946 607 682', 'contacto@abc.com', 'Edificio Pilar, 22', NULL, '2025-10-07T21:31:43.057Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (4, 'DNI', '11223344', 'Pedro Ramírez', NULL, NULL, '935 324 146', 'pedro@email.com', 'Rincón Mariano, 95', NULL, '2025-10-07T21:31:43.060Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (5, 'RUC', '20987654321', 'Construcciones XYZ', NULL, 'Construcciones XYZ', '919 965 289', 'ventas@xyz.com', 'Barrio Soledad Cavazos 2', NULL, '2025-10-07T21:31:43.063Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (6, 'DNI', '55667788', 'Rosa Jiménez', NULL, NULL, '976 725 565', 'rosa@email.com', 'Barrio Gonzalo Carbajal 6', NULL, '2025-10-07T21:31:43.066Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (7, 'RUC', '20456789123', 'Decoraciones Elite', NULL, 'Decoraciones Elite', '936.498.759', 'info@elite.com', 'Municipio Pilar Palomino 1', NULL, '2025-10-07T21:31:43.069Z', 1);
INSERT INTO "Client" ("id", "documentType", "documentNumber", "fullName", "contactPerson", "businessName", "phone", "email", "address", "notes", "createdAt", "companyId") VALUES (8, 'DNI', '99887766', 'Luis Vargas', NULL, NULL, '921 847 251', 'luis@email.com', 'Rua Jordi s/n.', NULL, '2025-10-07T21:31:43.072Z', 1);

-- ==========================================
-- Datos para tabla: colors
-- Registros: 10
-- ==========================================

TRUNCATE TABLE "colors" CASCADE;
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (1, 'Incoloro', '2025-10-07T22:37:49.225Z', '2025-10-07T22:37:49.225Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (2, 'Verde', '2025-10-07T22:37:49.235Z', '2025-10-07T22:37:49.235Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (3, 'Azul', '2025-10-07T22:37:49.240Z', '2025-10-07T22:37:49.240Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (4, 'Bronce', '2025-10-07T22:37:49.244Z', '2025-10-07T22:37:49.244Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (5, 'Gris', '2025-10-07T22:37:49.248Z', '2025-10-07T22:37:49.248Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (6, 'Negro', '2025-10-07T22:37:49.252Z', '2025-10-07T22:37:49.252Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (7, 'Dorado', '2025-10-07T22:37:49.256Z', '2025-10-07T22:37:49.256Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (8, 'Plata', '2025-10-07T22:37:49.260Z', '2025-10-07T22:37:49.260Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (9, 'Rojo', '2025-10-07T22:37:49.263Z', '2025-10-07T22:37:49.263Z');
INSERT INTO "colors" ("id", "name", "createdAt", "updatedAt") VALUES (10, 'Amarillo', '2025-10-07T22:37:49.266Z', '2025-10-07T22:37:49.266Z');

-- ==========================================
-- Datos para tabla: textures
-- Registros: 7
-- ==========================================

TRUNCATE TABLE "textures" CASCADE;
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (1, 'Liso', '2025-10-07T22:37:49.269Z', '2025-10-07T22:37:49.269Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (2, 'Cuadriculado', '2025-10-07T22:37:49.274Z', '2025-10-07T22:37:49.274Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (3, 'Llovizna', '2025-10-07T22:37:49.276Z', '2025-10-07T22:37:49.276Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (4, 'Garatachi', '2025-10-07T22:37:49.279Z', '2025-10-07T22:37:49.279Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (5, 'Flora', '2025-10-07T22:37:49.282Z', '2025-10-07T22:37:49.282Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (6, 'Marihuana', '2025-10-07T22:37:49.286Z', '2025-10-07T22:37:49.286Z');
INSERT INTO "textures" ("id", "name", "createdAt", "updatedAt") VALUES (7, 'Ramas', '2025-10-07T22:37:49.288Z', '2025-10-07T22:37:49.288Z');

-- ==========================================
-- Datos para tabla: molding_colors
-- Registros: 6
-- ==========================================

TRUNCATE TABLE "molding_colors" CASCADE;
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (1, 1, 'Natural', '2025-10-07T21:31:42.956Z', '2025-10-07T21:31:42.956Z');
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (2, 1, 'Dorado', '2025-10-07T21:31:42.959Z', '2025-10-07T21:31:42.959Z');
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (3, 1, 'Plateado', '2025-10-07T21:31:42.960Z', '2025-10-07T21:31:42.960Z');
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (4, 1, 'Negro', '2025-10-07T21:31:42.961Z', '2025-10-07T21:31:42.961Z');
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (5, 1, 'Blanco', '2025-10-07T21:31:42.962Z', '2025-10-07T21:31:42.962Z');
INSERT INTO "molding_colors" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (6, 1, 'Caoba', '2025-10-07T21:31:42.963Z', '2025-10-07T21:31:42.963Z');

-- ==========================================
-- Datos para tabla: molding_textures
-- Registros: 6
-- ==========================================

TRUNCATE TABLE "molding_textures" CASCADE;
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (1, 1, 'Lisa', '2025-10-07T21:31:42.945Z', '2025-10-07T21:31:42.945Z');
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (2, 1, 'Rugosa', '2025-10-07T21:31:42.947Z', '2025-10-07T21:31:42.947Z');
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (3, 1, 'Mate', '2025-10-07T21:31:42.949Z', '2025-10-07T21:31:42.949Z');
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (4, 1, 'Brillante', '2025-10-07T21:31:42.950Z', '2025-10-07T21:31:42.950Z');
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (5, 1, 'Texturizada', '2025-10-07T21:31:42.952Z', '2025-10-07T21:31:42.952Z');
INSERT INTO "molding_textures" ("id", "companyId", "name", "createdAt", "updatedAt") VALUES (6, 1, 'Acanalada', '2025-10-07T21:31:42.954Z', '2025-10-07T21:31:42.954Z');

-- ==========================================
-- Datos para tabla: pricing_thickness
-- Registros: 15
-- ==========================================

TRUNCATE TABLE "pricing_thickness" CASCADE;
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (1, 1, 'MEDIA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (2, 1, 'TRES_CUARTOS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (3, 1, 'UNA_PULGADA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (4, 1, 'UNA_Y_CUARTO');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (5, 1, 'UNA_Y_MEDIA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (6, 1, 'DOS_PULGADAS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (7, 1, 'TRES_PULGADAS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (8, 1, 'MEDIA_X_MEDIA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (9, 1, 'MEDIA_X_TRES_CUARTOS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (10, 1, 'MEDIA_X_UNA_PULGADA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (11, 1, 'TRES_CUARTOS_X_TRES_CUARTOS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (12, 1, 'UNA_PULGADA_X_UNA_PULGADA');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (13, 1, 'DOS_X_DOS');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (14, 1, 'DOS_X_TRES');
INSERT INTO "pricing_thickness" ("id", "companyId", "name") VALUES (15, 1, 'CUATRO_PULGADAS');

-- ==========================================
-- Datos para tabla: pricing_glass
-- Registros: 19
-- ==========================================

TRUNCATE TABLE "pricing_glass" CASCADE;
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (1, 1, 'Cristal Float', 'PLANO', '3.00', 'INCOLORO', NULL, NULL, '25.50', '2025-10-07T22:37:49.293Z', NULL, true, '2025-10-07T22:37:49.293Z', '2025-10-07T22:37:49.293Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (2, 1, 'Cristal Float', 'PLANO', '4.00', 'INCOLORO', NULL, NULL, '32.00', '2025-10-07T22:37:49.303Z', NULL, true, '2025-10-07T22:37:49.303Z', '2025-10-07T22:37:49.303Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (3, 1, 'Cristal Float', 'PLANO', '5.00', 'INCOLORO', NULL, NULL, '38.75', '2025-10-07T22:37:49.309Z', NULL, true, '2025-10-07T22:37:49.309Z', '2025-10-07T22:37:49.309Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (4, 1, 'Cristal Float', 'PLANO', '6.00', 'INCOLORO', NULL, NULL, '45.50', '2025-10-07T22:37:49.312Z', NULL, true, '2025-10-07T22:37:49.312Z', '2025-10-07T22:37:49.312Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (5, 1, 'Cristal Float Verde', 'PLANO', '4.00', 'COLOR', NULL, NULL, '42.00', '2025-10-07T22:37:49.318Z', NULL, true, '2025-10-07T22:37:49.318Z', '2025-10-07T22:46:08.069Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (6, 1, 'Cristal Float Azul', 'PLANO', '4.00', 'COLOR', NULL, NULL, '42.00', '2025-10-07T22:37:49.323Z', NULL, true, '2025-10-07T22:37:49.323Z', '2025-10-07T22:45:56.797Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (7, 1, 'Cristal Float Bronce', 'PLANO', '4.00', 'COLOR', NULL, NULL, '42.00', '2025-10-07T22:37:49.328Z', NULL, true, '2025-10-07T22:37:49.328Z', '2025-10-07T22:46:02.816Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (8, 1, 'Catedral Clásico', 'CATEDRAL', '3.00', 'INCOLORO', NULL, NULL, '28.00', '2025-10-07T22:37:49.331Z', NULL, true, '2025-10-07T22:37:49.331Z', '2025-10-07T22:37:49.331Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (9, 1, 'Catedral Clásico', 'CATEDRAL', '4.00', 'INCOLORO', NULL, NULL, '35.50', '2025-10-07T22:37:49.336Z', NULL, true, '2025-10-07T22:37:49.336Z', '2025-10-07T22:37:49.336Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (10, 1, 'Catedral Verde', 'CATEDRAL', '3.00', 'COLOR', NULL, NULL, '38.00', '2025-10-07T22:37:49.341Z', NULL, true, '2025-10-07T22:37:49.341Z', '2025-10-07T22:45:50.216Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (11, 1, 'Catedral Azul', 'CATEDRAL', '3.00', 'INCOLORO', NULL, NULL, '38.00', '2025-10-07T22:37:49.345Z', NULL, true, '2025-10-07T22:37:49.345Z', '2025-10-07T22:45:42.355Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (12, 1, 'Templado Incoloro', 'TEMPLADO', '6.00', 'INCOLORO', NULL, NULL, '85.00', '2025-10-07T22:37:49.347Z', NULL, true, '2025-10-07T22:37:49.347Z', '2025-10-07T22:37:49.347Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (13, 1, 'Templado Incoloro', 'TEMPLADO', '8.00', 'INCOLORO', NULL, NULL, '105.00', '2025-10-07T22:37:49.351Z', NULL, true, '2025-10-07T22:37:49.351Z', '2025-10-07T22:37:49.351Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (14, 1, 'Templado Incoloro', 'TEMPLADO', '10.00', 'INCOLORO', NULL, NULL, '125.00', '2025-10-07T22:37:49.355Z', NULL, true, '2025-10-07T22:37:49.355Z', '2025-10-07T22:37:49.355Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (15, 1, 'Templado Verde', 'TEMPLADO', '6.00', 'COLOR', 2, NULL, '95.00', '2025-10-07T22:37:49.359Z', NULL, true, '2025-10-07T22:37:49.359Z', '2025-10-07T22:37:49.359Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (16, 1, 'Espejo Plata', 'ESPEJO', '3.00', 'INCOLORO', NULL, NULL, '55.00', '2025-10-07T22:37:49.362Z', NULL, true, '2025-10-07T22:37:49.362Z', '2025-10-07T22:37:49.362Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (17, 1, 'Espejo Plata', 'ESPEJO', '4.00', 'INCOLORO', NULL, NULL, '68.00', '2025-10-07T22:37:49.366Z', NULL, true, '2025-10-07T22:37:49.366Z', '2025-10-07T22:37:49.366Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (18, 1, 'Espejo Bronce', 'ESPEJO', '4.00', 'COLOR', NULL, NULL, '78.00', '2025-10-07T22:37:49.370Z', NULL, true, '2025-10-07T22:37:49.370Z', '2025-10-07T22:46:22.182Z');
INSERT INTO "pricing_glass" ("id", "companyId", "commercialName", "family", "thicknessMM", "colorType", "colorId", "oldColor", "price", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (19, 1, 'Espejo Gris', 'ESPEJO', '4.00', 'COLOR', NULL, NULL, '78.00', '2025-10-07T22:37:49.373Z', NULL, true, '2025-10-07T22:37:49.373Z', '2025-10-07T22:46:26.979Z');

-- ==========================================
-- Datos para tabla: pricing_molding
-- Registros: 13
-- ==========================================

TRUNCATE TABLE "pricing_molding" CASCADE;
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (1, 1, 'Marco Clásico Simple', 'SIMPLE', 1, '15.50', '2025-10-07T21:31:42.965Z', NULL, true, '2025-10-07T21:31:42.965Z', '2025-10-07T21:31:42.965Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (2, 1, 'Marco Elegante Simple', 'SIMPLE', 2, '18.75', '2025-10-07T21:31:42.975Z', NULL, true, '2025-10-07T21:31:42.975Z', '2025-10-07T21:31:42.975Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (3, 1, 'Marco Moderno Simple', 'SIMPLE', 3, '22.30', '2025-10-07T21:31:42.980Z', NULL, true, '2025-10-07T21:31:42.980Z', '2025-10-07T21:31:42.980Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (4, 1, 'Marco Tradicional Simple', 'SIMPLE', 4, '19.80', '2025-10-07T21:31:42.986Z', NULL, true, '2025-10-07T21:31:42.986Z', '2025-10-07T21:31:42.986Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (5, 1, 'Marco Dorado Fino', 'FINA', 5, '45.60', '2025-10-07T21:31:42.991Z', NULL, true, '2025-10-07T21:31:42.991Z', '2025-10-07T21:31:42.991Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (6, 1, 'Marco Plateado Fino', 'FINA', 6, '52.25', '2025-10-07T21:31:42.995Z', NULL, true, '2025-10-07T21:31:42.995Z', '2025-10-07T21:31:42.995Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (7, 1, 'Marco Ornamentado Fino', 'FINA', 7, '67.90', '2025-10-07T21:31:42.999Z', NULL, true, '2025-10-07T21:31:42.999Z', '2025-10-07T21:31:42.999Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (8, 1, 'Marco Artesanal Fino', 'FINA', 3, '58.40', '2025-10-07T21:31:43.004Z', NULL, true, '2025-10-07T21:31:43.004Z', '2025-10-07T21:31:43.004Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (9, 1, 'Bastidor Básico', 'BASTIDOR', 8, '12.75', '2025-10-07T21:31:43.008Z', NULL, true, '2025-10-07T21:31:43.008Z', '2025-10-07T21:31:43.008Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (10, 1, 'Bastidor Reforzado', 'BASTIDOR', 9, '16.20', '2025-10-07T21:31:43.011Z', NULL, true, '2025-10-07T21:31:43.011Z', '2025-10-07T21:31:43.011Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (11, 1, 'Bastidor Premium', 'BASTIDOR', 10, '18.90', '2025-10-07T21:31:43.014Z', NULL, true, '2025-10-07T21:31:43.014Z', '2025-10-07T21:31:43.014Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (12, 1, 'Bastidor Profesional', 'BASTIDOR', 11, '21.45', '2025-10-07T21:31:43.016Z', NULL, true, '2025-10-07T21:31:43.016Z', '2025-10-07T21:31:43.016Z');
INSERT INTO "pricing_molding" ("id", "companyId", "name", "quality", "thicknessId", "pricePerM", "validFrom", "validTo", "isActive", "createdAt", "updatedAt") VALUES (13, 1, 'Marco Rústico Simple', 'SIMPLE', 12, '24.60', '2025-10-07T21:31:43.019Z', NULL, true, '2025-10-07T21:31:43.019Z', '2025-10-07T21:31:43.019Z');

-- ==========================================
-- Datos para tabla: Quote
-- Registros: 6
-- ==========================================

TRUNCATE TABLE "Quote" CASCADE;
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (1, 'COT-2024-001', 1, '2025-10-07T21:31:43.076Z', 'PENDING', 'Sollers deorsum aiunt conicio textus pel custodia statua sollers.', 2473.26, 'cmggs1vid0001kzw4o7m81t0o', 1);
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (2, 'COT-2024-002', 2, '2025-10-07T21:31:43.087Z', 'ACCEPTED', 'Cupiditate supplanto tribuo.', 5325.26, 'cmggs1vid0001kzw4o7m81t0o', 1);
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (3, 'COT-2024-003', 3, '2025-10-07T21:31:43.094Z', 'PENDING', 'Necessitatibus volubilis vesco.', 5008.48, 'cmggs1vid0001kzw4o7m81t0o', 1);
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (4, 'COT-2024-004', 4, '2025-10-07T21:31:43.099Z', 'REJECTED', 'Vilicus pariatur sunt aranea tabella crastinus terga damno vesco.', 3859.27, 'cmggs1vid0001kzw4o7m81t0o', 1);
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (5, 'COT-2024-005', 5, '2025-10-07T21:31:43.108Z', 'ACCEPTED', 'Caterva addo altus.', 2309.99, 'cmggs1vid0001kzw4o7m81t0o', 1);
INSERT INTO "Quote" ("id", "code", "clientId", "createdAt", "status", "notes", "total", "createdById", "companyId") VALUES (6, 'COT-2024-006', 6, '2025-10-07T21:31:43.114Z', 'PENDING', 'Tergo laudantium sufficio accommodo uter torrens velum.', 2647.1, 'cmggs1vid0001kzw4o7m81t0o', 1);

-- ==========================================
-- Datos para tabla: QuoteItem
-- Registros: 19
-- ==========================================

TRUNCATE TABLE "QuoteItem" CASCADE;
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (1, 1, 'Rústico Hormigon Ordenador - Item 1', 'PZA', 2, 198.74, 397.48);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (2, 1, 'Increible Plástico Queso - Item 2', 'PZA', 3, 498.38, 1495.14);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (3, 1, 'Sorprendente Plástico Patatas fritas - Item 3', 'PZA', 8, 72.58, 580.64);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (4, 2, 'Inteligente Hormigon Patatas fritas - Item 1', 'PZA', 8, 367.42, 2939.36);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (5, 2, 'Práctico Ladrillo Ensalada - Item 2', 'PZA', 5, 477.18, 2385.9);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (6, 3, 'Inteligente Madera Ordenador - Item 1', 'PZA', 6, 366.1, 2196.6);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (7, 3, 'Fantástico Madera Ensalada - Item 2', 'PZA', 6, 347.46, 2084.76);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (8, 3, 'Rústico Acero Bicicleta - Item 3', 'PZA', 8, 90.89, 727.12);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (9, 4, 'Guapa Plástico Ordenador - Item 1', 'PZA', 8, 28.91, 231.28);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (10, 4, 'Refinado Granito Ordenador - Item 2', 'PZA', 7, 287.43, 2012.01);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (11, 4, 'Inteligente Plástico Pescado - Item 3', 'PZA', 10, 145.98, 1459.8);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (12, 4, 'Rústico Acero Pantalones - Item 4', 'PZA', 2, 78.09, 156.18);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (13, 5, 'Sabroso Acero Pizza - Item 1', 'PZA', 3, 283.17, 849.51);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (14, 5, 'Sabroso Algodón Camiseta - Item 2', 'PZA', 8, 122.24, 977.92);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (15, 5, 'Pequeño Plástico Teclado - Item 3', 'PZA', 1, 482.56, 482.56);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (16, 6, 'Ergonómico Granito Raton - Item 1', 'PZA', 4, 310.54, 1242.16);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (17, 6, 'Rústico Madera Raton - Item 2', 'PZA', 7, 32.09, 224.63);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (18, 6, 'Sorprendente Granito Sopa - Item 3', 'PZA', 4, 127.61, 510.44);
INSERT INTO "QuoteItem" ("id", "quoteId", "description", "unit", "quantity", "unitPrice", "subtotal") VALUES (19, 6, 'Refinado Algodón Raton - Item 4', 'PZA', 9, 74.43, 669.8700000000001);

-- ==========================================
-- Datos para tabla: users
-- Registros: 3
-- ==========================================

TRUNCATE TABLE "users" CASCADE;
INSERT INTO "users" ("id", "email", "name", "username", "lastLogin", "password", "phone", "isActive", "role", "email_verified", "image", "createdAt", "updatedAt", "companyId") VALUES ('cmggs1vid0001kzw4o7m81t0o', 'admin@vidrieriademo.com', 'Juan Pérez', 'admin', NULL, 'password123', NULL, true, 'ADMIN', NULL, NULL, '2025-10-07T21:31:43.045Z', '2025-10-07T21:31:43.045Z', 1);
INSERT INTO "users" ("id", "email", "name", "username", "lastLogin", "password", "phone", "isActive", "role", "email_verified", "image", "createdAt", "updatedAt", "companyId") VALUES ('cmggs1vig0003kzw4r2ly2fmj', 'maria@vidrieriademo.com', 'María García', 'vendedor1', NULL, 'password123', NULL, true, 'OPERATOR', NULL, NULL, '2025-10-07T21:31:43.048Z', '2025-10-07T21:31:43.048Z', 1);
INSERT INTO "users" ("id", "email", "name", "username", "lastLogin", "password", "phone", "isActive", "role", "email_verified", "image", "createdAt", "updatedAt", "companyId") VALUES ('super-admin-cosmos', 'admin@cosmos.com', 'Super Administrador', 'superadmin', NULL, '$2b$12$gdbT4XcVNNA9MydO6j5E7.ykQ/ghH8Kx8yCBynqM/igrACBzFVjtW', NULL, true, 'SUPER_ADMIN', '2025-10-07T21:31:56.103Z', NULL, '2025-10-07T21:31:56.120Z', '2025-10-07T21:31:56.120Z', NULL);

-- Tabla Contract: Sin datos

-- Tabla ContractItem: Sin datos

-- Tabla Payment: Sin datos

-- Tabla Observation: Sin datos

-- Tabla accounts: Sin datos

-- Tabla sessions: Sin datos

-- Tabla verification_tokens: Sin datos

-- Tabla pricing_accessory: Sin datos

-- Tabla pricing_backing: Sin datos

-- Tabla pricing_frame_preset: Sin datos

-- Tabla pricing_matboard: Sin datos

-- ============================================
-- COMPLETADO EXITOSAMENTE
-- Total de registros: 118
-- ============================================

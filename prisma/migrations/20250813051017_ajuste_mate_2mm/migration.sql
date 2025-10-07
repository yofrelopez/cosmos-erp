/*
  Warnings:

  - The values [PLANO,CATEDRAL,TEMPLADO,REFLEJANTE] on the enum `PricingGlassFamily` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFLEJANTE] on the enum `PricingGlassFinish` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PricingGlassFamily_new" AS ENUM ('Plano', 'Catedral', 'Templado', 'Reflejante');
ALTER TABLE "pricing_glass_base" ALTER COLUMN "family" TYPE "PricingGlassFamily_new" USING ("family"::text::"PricingGlassFamily_new");
ALTER TABLE "pricing_glass_modifier" ALTER COLUMN "family" TYPE "PricingGlassFamily_new" USING ("family"::text::"PricingGlassFamily_new");
ALTER TYPE "PricingGlassFamily" RENAME TO "PricingGlassFamily_old";
ALTER TYPE "PricingGlassFamily_new" RENAME TO "PricingGlassFamily";
DROP TYPE "PricingGlassFamily_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PricingGlassFinish_new" AS ENUM ('INCOLORO', 'MATE', 'POLARIZADO', 'COLOR');
ALTER TABLE "pricing_glass_modifier" ALTER COLUMN "finish" TYPE "PricingGlassFinish_new" USING ("finish"::text::"PricingGlassFinish_new");
ALTER TYPE "PricingGlassFinish" RENAME TO "PricingGlassFinish_old";
ALTER TYPE "PricingGlassFinish_new" RENAME TO "PricingGlassFinish";
DROP TYPE "PricingGlassFinish_old";
COMMIT;

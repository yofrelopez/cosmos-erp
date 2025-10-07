/*
  Warnings:

  - You are about to drop the `pricing_glass_base` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing_glass_modifier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing_glass_service` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GlassFamily" AS ENUM ('PLANO', 'CATEDRAL', 'TEMPLADO', 'ESPEJO');

-- CreateEnum
CREATE TYPE "GlassColor" AS ENUM ('INCOLORO', 'GRIS', 'AMBAR', 'AZUL');

-- CreateEnum
CREATE TYPE "GlassTexture" AS ENUM ('LISO', 'CUADRICULADO', 'LLOVIZNA', 'GARATACHI', 'FLORA', 'MARIHUANA', 'RAMAS');

-- DropForeignKey
ALTER TABLE "pricing_glass_base" DROP CONSTRAINT "pricing_glass_base_companyId_fkey";

-- DropForeignKey
ALTER TABLE "pricing_glass_modifier" DROP CONSTRAINT "pricing_glass_modifier_companyId_fkey";

-- DropForeignKey
ALTER TABLE "pricing_glass_service" DROP CONSTRAINT "pricing_glass_service_companyId_fkey";

-- DropTable
DROP TABLE "pricing_glass_base";

-- DropTable
DROP TABLE "pricing_glass_modifier";

-- DropTable
DROP TABLE "pricing_glass_service";

-- DropEnum
DROP TYPE "PricingCatedralPattern";

-- DropEnum
DROP TYPE "PricingColor";

-- DropEnum
DROP TYPE "PricingGlassFamily";

-- DropEnum
DROP TYPE "PricingGlassFinish";

-- DropEnum
DROP TYPE "PricingGlassProcessType";

-- DropEnum
DROP TYPE "PricingModifierTarget";

-- DropEnum
DROP TYPE "PricingModifierValueType";

-- DropEnum
DROP TYPE "PricingUnit";

-- CreateTable
CREATE TABLE "pricing_glass" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "commercialName" TEXT NOT NULL DEFAULT 'Vidrio',
    "family" "GlassFamily" NOT NULL,
    "thicknessMM" DECIMAL(5,2) NOT NULL,
    "color" "GlassColor" NOT NULL DEFAULT 'INCOLORO',
    "price" DECIMAL(12,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_glass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glass_texture_reference" (
    "id" SERIAL NOT NULL,
    "family" "GlassFamily" NOT NULL,
    "texture" "GlassTexture" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glass_texture_reference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_glass_companyId_commercialName_idx" ON "pricing_glass"("companyId", "commercialName");

-- CreateIndex
CREATE INDEX "pricing_glass_companyId_family_idx" ON "pricing_glass"("companyId", "family");

-- CreateIndex
CREATE INDEX "pricing_glass_isActive_idx" ON "pricing_glass"("isActive");

-- CreateIndex
CREATE INDEX "pricing_glass_validFrom_idx" ON "pricing_glass"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_validTo_idx" ON "pricing_glass"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_glass_companyId_commercialName_family_thicknessMM_c_key" ON "pricing_glass"("companyId", "commercialName", "family", "thicknessMM", "color", "validFrom");

-- CreateIndex
CREATE INDEX "glass_texture_reference_family_idx" ON "glass_texture_reference"("family");

-- CreateIndex
CREATE INDEX "glass_texture_reference_isActive_idx" ON "glass_texture_reference"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "glass_texture_reference_family_texture_key" ON "glass_texture_reference"("family", "texture");

-- AddForeignKey
ALTER TABLE "pricing_glass" ADD CONSTRAINT "pricing_glass_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

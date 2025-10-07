-- CreateEnum
CREATE TYPE "PricingGlassFamily" AS ENUM ('PLANO', 'CATEDRAL');

-- CreateEnum
CREATE TYPE "PricingGlassFinish" AS ENUM ('INCOLORO', 'MATE', 'POLARIZADO', 'REFLEJANTE');

-- CreateEnum
CREATE TYPE "PricingColor" AS ENUM ('NONE', 'GRIS', 'AMBAR', 'AZUL');

-- CreateEnum
CREATE TYPE "PricingCatedralPattern" AS ENUM ('FLORA', 'CUADRICULADO', 'KARATACHI', 'MARI', 'LLOVIZNA', 'OTRO');

-- CreateEnum
CREATE TYPE "PricingUnit" AS ENUM ('FT2', 'UNIDAD');

-- CreateEnum
CREATE TYPE "PricingGlassProcessType" AS ENUM ('CANTO_PULIDO', 'CANTO_BISEL', 'PERFORACION', 'ESQUINA_REDONDA', 'CORTE_ESPECIAL');

-- CreateEnum
CREATE TYPE "PricingModifierTarget" AS ENUM ('FINISH_COLOR', 'CATEDRAL_COLOR', 'TEMPLADO');

-- CreateEnum
CREATE TYPE "PricingModifierValueType" AS ENUM ('FLAT', 'PERCENT');

-- CreateEnum
CREATE TYPE "PricingMoldingQuality" AS ENUM ('SIMPLE', 'FINA');

-- CreateEnum
CREATE TYPE "PricingMoldingThickness" AS ENUM ('MEDIA', 'TRES_CUARTOS', 'UNA_PULGADA', 'PULGADA_Y_MEDIA', 'PULGADA_TRES_CUARTOS', 'DOS_PULGADAS', 'OTRO');

-- CreateEnum
CREATE TYPE "PricingFrameKind" AS ENUM ('SIN_FONDO', 'CON_FONDO', 'FONDO_TRANSPARENTE', 'CON_BASTIDOR', 'ESPECIAL');

-- CreateTable
CREATE TABLE "pricing_glass_base" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "family" "PricingGlassFamily" NOT NULL,
    "thicknessMM" DECIMAL(5,2) NOT NULL,
    "pricePerFt2" DECIMAL(12,2) NOT NULL,
    "minBillableFt2" DECIMAL(6,2),
    "minCharge" DECIMAL(12,2),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_glass_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_glass_modifier" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "target" "PricingModifierTarget" NOT NULL,
    "family" "PricingGlassFamily",
    "finish" "PricingGlassFinish",
    "color" "PricingColor",
    "minThicknessMM" DECIMAL(5,2),
    "valueType" "PricingModifierValueType" NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_glass_modifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_glass_service" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "process" "PricingGlassProcessType" NOT NULL,
    "unit" "PricingUnit" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "minCharge" DECIMAL(12,2),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_glass_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_molding" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quality" "PricingMoldingQuality" NOT NULL,
    "thickness" "PricingMoldingThickness" NOT NULL,
    "pricePerM" DECIMAL(12,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_molding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_matboard" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerFt2" DECIMAL(12,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_matboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_accessory" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_backing" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerFt2" DECIMAL(12,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_backing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_frame_preset" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "PricingFrameKind" NOT NULL,
    "recipe" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_frame_preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_glass_base_companyId_family_thicknessMM_idx" ON "pricing_glass_base"("companyId", "family", "thicknessMM");

-- CreateIndex
CREATE INDEX "pricing_glass_base_isActive_idx" ON "pricing_glass_base"("isActive");

-- CreateIndex
CREATE INDEX "pricing_glass_base_validFrom_idx" ON "pricing_glass_base"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_base_validTo_idx" ON "pricing_glass_base"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_glass_base_companyId_family_thicknessMM_validFrom_key" ON "pricing_glass_base"("companyId", "family", "thicknessMM", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_modifier_companyId_target_idx" ON "pricing_glass_modifier"("companyId", "target");

-- CreateIndex
CREATE INDEX "pricing_glass_modifier_family_finish_color_idx" ON "pricing_glass_modifier"("family", "finish", "color");

-- CreateIndex
CREATE INDEX "pricing_glass_modifier_isActive_idx" ON "pricing_glass_modifier"("isActive");

-- CreateIndex
CREATE INDEX "pricing_glass_modifier_validFrom_idx" ON "pricing_glass_modifier"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_modifier_validTo_idx" ON "pricing_glass_modifier"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_glass_modifier_companyId_target_family_finish_color_key" ON "pricing_glass_modifier"("companyId", "target", "family", "finish", "color", "minThicknessMM", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_service_companyId_process_unit_idx" ON "pricing_glass_service"("companyId", "process", "unit");

-- CreateIndex
CREATE INDEX "pricing_glass_service_isActive_idx" ON "pricing_glass_service"("isActive");

-- CreateIndex
CREATE INDEX "pricing_glass_service_validFrom_idx" ON "pricing_glass_service"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_glass_service_validTo_idx" ON "pricing_glass_service"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_glass_service_companyId_process_unit_validFrom_key" ON "pricing_glass_service"("companyId", "process", "unit", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_molding_companyId_name_quality_thickness_idx" ON "pricing_molding"("companyId", "name", "quality", "thickness");

-- CreateIndex
CREATE INDEX "pricing_molding_isActive_idx" ON "pricing_molding"("isActive");

-- CreateIndex
CREATE INDEX "pricing_molding_validFrom_idx" ON "pricing_molding"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_molding_validTo_idx" ON "pricing_molding"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_molding_companyId_name_thickness_validFrom_key" ON "pricing_molding"("companyId", "name", "thickness", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_matboard_companyId_name_idx" ON "pricing_matboard"("companyId", "name");

-- CreateIndex
CREATE INDEX "pricing_matboard_isActive_idx" ON "pricing_matboard"("isActive");

-- CreateIndex
CREATE INDEX "pricing_matboard_validFrom_idx" ON "pricing_matboard"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_matboard_validTo_idx" ON "pricing_matboard"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_matboard_companyId_name_validFrom_key" ON "pricing_matboard"("companyId", "name", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_accessory_companyId_name_idx" ON "pricing_accessory"("companyId", "name");

-- CreateIndex
CREATE INDEX "pricing_accessory_isActive_idx" ON "pricing_accessory"("isActive");

-- CreateIndex
CREATE INDEX "pricing_accessory_validFrom_idx" ON "pricing_accessory"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_accessory_validTo_idx" ON "pricing_accessory"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_accessory_companyId_name_validFrom_key" ON "pricing_accessory"("companyId", "name", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_backing_companyId_name_idx" ON "pricing_backing"("companyId", "name");

-- CreateIndex
CREATE INDEX "pricing_backing_isActive_idx" ON "pricing_backing"("isActive");

-- CreateIndex
CREATE INDEX "pricing_backing_validFrom_idx" ON "pricing_backing"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_backing_validTo_idx" ON "pricing_backing"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_backing_companyId_name_validFrom_key" ON "pricing_backing"("companyId", "name", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_frame_preset_companyId_kind_isActive_idx" ON "pricing_frame_preset"("companyId", "kind", "isActive");

-- CreateIndex
CREATE INDEX "pricing_frame_preset_validFrom_idx" ON "pricing_frame_preset"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_frame_preset_validTo_idx" ON "pricing_frame_preset"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_frame_preset_companyId_name_validFrom_key" ON "pricing_frame_preset"("companyId", "name", "validFrom");

-- AddForeignKey
ALTER TABLE "pricing_glass_base" ADD CONSTRAINT "pricing_glass_base_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_glass_modifier" ADD CONSTRAINT "pricing_glass_modifier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_glass_service" ADD CONSTRAINT "pricing_glass_service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_molding" ADD CONSTRAINT "pricing_molding_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_matboard" ADD CONSTRAINT "pricing_matboard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_accessory" ADD CONSTRAINT "pricing_accessory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_backing" ADD CONSTRAINT "pricing_backing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_frame_preset" ADD CONSTRAINT "pricing_frame_preset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

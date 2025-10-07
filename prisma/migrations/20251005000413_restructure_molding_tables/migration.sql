/*
  Warnings:

  - You are about to drop the column `category` on the `pricing_thickness` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `pricing_thickness` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `pricing_thickness` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerM` on the `pricing_thickness` table. All the data in the column will be lost.
  - You are about to drop the column `validFrom` on the `pricing_thickness` table. All the data in the column will be lost.
  - You are about to drop the column `validTo` on the `pricing_thickness` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `pricing_thickness` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "PricingMoldingQuality" ADD VALUE 'BASTIDOR';

-- DropForeignKey
ALTER TABLE "pricing_thickness" DROP CONSTRAINT "pricing_thickness_companyId_fkey";

-- DropIndex
DROP INDEX "pricing_thickness_companyId_category_idx";

-- DropIndex
DROP INDEX "pricing_thickness_companyId_name_category_validFrom_key";

-- AlterTable
ALTER TABLE "pricing_thickness" DROP COLUMN "category",
DROP COLUMN "companyId",
DROP COLUMN "isActive",
DROP COLUMN "pricePerM",
DROP COLUMN "validFrom",
DROP COLUMN "validTo";

-- CreateTable
CREATE TABLE "molding_textures" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "molding_textures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "molding_colors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "molding_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "molding_textures_name_key" ON "molding_textures"("name");

-- CreateIndex
CREATE UNIQUE INDEX "molding_colors_name_key" ON "molding_colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_thickness_name_key" ON "pricing_thickness"("name");

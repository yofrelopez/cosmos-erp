/*
  Warnings:

  - You are about to drop the column `thickness` on the `pricing_molding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId,name,thicknessId,validFrom]` on the table `pricing_molding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `thicknessId` to the `pricing_molding` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "pricing_molding_companyId_name_quality_thickness_idx";

-- DropIndex
DROP INDEX "pricing_molding_companyId_name_thickness_validFrom_key";

-- AlterTable
ALTER TABLE "pricing_molding" DROP COLUMN "thickness",
ADD COLUMN     "thicknessId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "PricingMoldingThickness";

-- CreateTable
CREATE TABLE "pricing_thickness" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pricePerM" DECIMAL(12,2),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_thickness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_thickness_companyId_category_idx" ON "pricing_thickness"("companyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_thickness_companyId_name_category_validFrom_key" ON "pricing_thickness"("companyId", "name", "category", "validFrom");

-- CreateIndex
CREATE INDEX "pricing_molding_companyId_name_quality_thicknessId_idx" ON "pricing_molding"("companyId", "name", "quality", "thicknessId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_molding_companyId_name_thicknessId_validFrom_key" ON "pricing_molding"("companyId", "name", "thicknessId", "validFrom");

-- AddForeignKey
ALTER TABLE "pricing_thickness" ADD CONSTRAINT "pricing_thickness_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_molding" ADD CONSTRAINT "pricing_molding_thicknessId_fkey" FOREIGN KEY ("thicknessId") REFERENCES "pricing_thickness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

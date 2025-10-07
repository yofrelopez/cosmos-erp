/*
  Warnings:

  - You are about to drop the column `color` on the `pricing_glass` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId,commercialName,family,thicknessMM,validFrom]` on the table `pricing_glass` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GlassColorType" AS ENUM ('INCOLORO', 'COLOR', 'POLARIZADO');

-- DropIndex
DROP INDEX "pricing_glass_companyId_commercialName_family_thicknessMM_c_key";

-- AlterTable
ALTER TABLE "pricing_glass" DROP COLUMN "color",
ADD COLUMN     "colorId" INTEGER,
ADD COLUMN     "colorType" "GlassColorType" NOT NULL DEFAULT 'INCOLORO',
ADD COLUMN     "oldColor" TEXT,
ALTER COLUMN "commercialName" DROP DEFAULT;

-- DropEnum
DROP TYPE "GlassColor";

-- CreateTable
CREATE TABLE "colors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_key" ON "colors"("name");

-- CreateIndex
CREATE INDEX "pricing_glass_colorType_idx" ON "pricing_glass"("colorType");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_glass_companyId_commercialName_family_thicknessMM_v_key" ON "pricing_glass"("companyId", "commercialName", "family", "thicknessMM", "validFrom");

-- AddForeignKey
ALTER TABLE "pricing_glass" ADD CONSTRAINT "pricing_glass_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

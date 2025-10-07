/*
  Warnings:

  - You are about to drop the `glass_texture_reference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "glass_texture_reference";

-- CreateTable
CREATE TABLE "pricing_texture" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "textureType" "GlassTexture" NOT NULL,
    "family" "GlassFamily" NOT NULL,
    "description" TEXT,
    "pricePerFt2" DECIMAL(12,2),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_texture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_texture_companyId_name_idx" ON "pricing_texture"("companyId", "name");

-- CreateIndex
CREATE INDEX "pricing_texture_companyId_family_idx" ON "pricing_texture"("companyId", "family");

-- CreateIndex
CREATE INDEX "pricing_texture_textureType_idx" ON "pricing_texture"("textureType");

-- CreateIndex
CREATE INDEX "pricing_texture_isActive_idx" ON "pricing_texture"("isActive");

-- CreateIndex
CREATE INDEX "pricing_texture_validFrom_idx" ON "pricing_texture"("validFrom");

-- CreateIndex
CREATE INDEX "pricing_texture_validTo_idx" ON "pricing_texture"("validTo");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_texture_companyId_name_family_validFrom_key" ON "pricing_texture"("companyId", "name", "family", "validFrom");

-- AddForeignKey
ALTER TABLE "pricing_texture" ADD CONSTRAINT "pricing_texture_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

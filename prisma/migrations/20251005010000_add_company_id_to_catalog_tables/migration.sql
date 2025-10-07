-- AlterTable
ALTER TABLE "molding_colors" ADD COLUMN "companyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "molding_textures" ADD COLUMN "companyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pricing_thickness" ADD COLUMN "companyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "molding_colors_companyId_name_key" ON "molding_colors"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "molding_textures_companyId_name_key" ON "molding_textures"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_thickness_companyId_name_key" ON "pricing_thickness"("companyId", "name");

-- AddForeignKey
ALTER TABLE "pricing_thickness" ADD CONSTRAINT "pricing_thickness_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "molding_textures" ADD CONSTRAINT "molding_textures_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "molding_colors" ADD CONSTRAINT "molding_colors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
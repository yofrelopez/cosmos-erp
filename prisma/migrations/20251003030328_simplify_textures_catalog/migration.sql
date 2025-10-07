/*
  Warnings:

  - You are about to drop the `pricing_texture` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pricing_texture" DROP CONSTRAINT "pricing_texture_companyId_fkey";

-- DropTable
DROP TABLE "pricing_texture";

-- CreateTable
CREATE TABLE "textures" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "textures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "textures_name_key" ON "textures"("name");

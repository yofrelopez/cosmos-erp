/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quote_code_key" ON "Quote"("code");

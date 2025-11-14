-- CreateTable
CREATE TABLE "QuoteItemImage" (
    "id" SERIAL NOT NULL,
    "quoteItemId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteItemImage_quoteItemId_idx" ON "QuoteItemImage"("quoteItemId");

-- AddForeignKey
ALTER TABLE "QuoteItemImage" ADD CONSTRAINT "QuoteItemImage_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

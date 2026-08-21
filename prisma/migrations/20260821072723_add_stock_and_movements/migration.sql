-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockGrams" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "amountGrams" INTEGER NOT NULL,
    "deltaGrams" INTEGER NOT NULL,
    "reason" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_productId_date_idx" ON "StockMovement"("productId", "date");

-- CreateIndex
CREATE INDEX "StockMovement_date_idx" ON "StockMovement"("date");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

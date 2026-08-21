-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'kg';

-- CreateTable
CREATE TABLE "DailyMenuEntry" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priceToday" INTEGER NOT NULL,
    "qtyGrams" INTEGER NOT NULL,
    "soldGrams" INTEGER NOT NULL DEFAULT 0,
    "spoiledGrams" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMenuEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLoss" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountGrams" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLoss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMenuEntry_productId_date_key" ON "DailyMenuEntry"("productId", "date");

-- AddForeignKey
ALTER TABLE "DailyMenuEntry" ADD CONSTRAINT "DailyMenuEntry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLoss" ADD CONSTRAINT "InventoryLoss_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `TaxPayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TaxPayment" ALTER COLUMN "orderId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayment_orderId_key" ON "TaxPayment"("orderId");

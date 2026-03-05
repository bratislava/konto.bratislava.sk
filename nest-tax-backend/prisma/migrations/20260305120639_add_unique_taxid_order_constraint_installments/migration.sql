/*
  Warnings:

  - A unique constraint covering the columns `[taxId,order]` on the table `TaxInstallment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaxInstallment_taxId_order_key" ON "TaxInstallment"("taxId", "order");

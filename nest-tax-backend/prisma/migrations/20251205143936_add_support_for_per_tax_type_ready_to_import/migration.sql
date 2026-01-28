/*
  Warnings:

  - You are about to drop the column `readyToImport` on the `TaxPayer` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."TaxPayer_readyToImport_idx";

-- AlterTable
ALTER TABLE "TaxPayer" DROP COLUMN "readyToImport",
ADD COLUMN     "readyToImportDZN" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readyToImportKO" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "TaxPayer_readyToImportDZN_idx" ON "TaxPayer"("readyToImportDZN");

-- CreateIndex
CREATE INDEX "TaxPayer_readyToImportKO_idx" ON "TaxPayer"("readyToImportKO");

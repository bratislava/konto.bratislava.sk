/*
  Warnings:

  - You are about to drop the column `lastCheckedUpdates` on the `Tax` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tax" DROP COLUMN "lastCheckedUpdates";

-- AlterTable
ALTER TABLE "TaxPayer" ADD COLUMN     "lastUpdatedAtDZN" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastUpdatedAtKO" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "TaxPayer_lastUpdatedAtDZN_idx" ON "TaxPayer"("lastUpdatedAtDZN");

-- CreateIndex
CREATE INDEX "TaxPayer_lastUpdatedAtKO_idx" ON "TaxPayer"("lastUpdatedAtKO");

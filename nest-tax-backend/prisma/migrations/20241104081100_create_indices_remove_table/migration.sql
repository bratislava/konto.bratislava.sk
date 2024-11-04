/*
  Warnings:

  - You are about to drop the `LoadingPaymentsFromNoris` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NEW', 'FAIL', 'SUCCESS');

-- AlterTable
ALTER TABLE "TaxPayment" 
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "PaymentStatus" USING status::text::"PaymentStatus",
ALTER COLUMN "status" SET DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "Tax_year_lastCheckedPayments_idx" ON "Tax"("year", "lastCheckedPayments");

-- CreateIndex
CREATE INDEX "TaxPayment_status_idx" ON "TaxPayment"("status");

-- DropTable
DROP TABLE "LoadingPaymentsFromNoris";

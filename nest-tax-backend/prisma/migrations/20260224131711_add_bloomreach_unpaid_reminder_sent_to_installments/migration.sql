-- CreateEnum
CREATE TYPE "UnpaidReminderSent" AS ENUM ('NONE', 'BEFORE_DUE', 'AFTER_DUE', 'BOTH');

-- AlterTable
ALTER TABLE "TaxInstallment" ADD COLUMN     "bloomreachUnpaidReminderSent" "UnpaidReminderSent" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "TaxInstallment_taxId_order_idx" ON "TaxInstallment"("taxId", "order");

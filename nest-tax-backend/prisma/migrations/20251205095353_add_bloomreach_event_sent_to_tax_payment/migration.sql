-- AlterTable
ALTER TABLE "TaxPayment" ADD COLUMN     "bloomreachEventSent" BOOLEAN NOT NULL DEFAULT false;

-- Set all existing payments to true since they were processed before this change
UPDATE "TaxPayment"
SET "bloomreachEventSent" = true;

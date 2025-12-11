-- AlterTable
ALTER TABLE "TaxPayment" ADD COLUMN     "bloomreachEventSent" BOOLEAN NOT NULL DEFAULT false;

-- Set all existing payments to bloomreachEventSent = true
UPDATE "TaxPayment" SET "bloomreachEventSent" = true;

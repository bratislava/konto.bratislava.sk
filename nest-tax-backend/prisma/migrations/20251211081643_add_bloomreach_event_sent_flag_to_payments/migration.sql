-- AlterTable
ALTER TABLE "TaxPayment" ADD COLUMN     "bloomreachEventSent" BOOLEAN;

-- Set all existing payments to true
UPDATE "TaxPayment" SET "bloomreachEventSent" = true;

-- Make the column NOT NULL
ALTER TABLE "TaxPayment" ALTER COLUMN "bloomreachEventSent" SET NOT NULL;

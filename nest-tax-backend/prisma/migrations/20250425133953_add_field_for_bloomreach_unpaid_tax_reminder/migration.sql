-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "bloomreachUnpaidTaxReminderSent" BOOLEAN NOT NULL DEFAULT false;

-- Do not send this notifications for taxes in the past years.
UPDATE "Tax"
SET "bloomreachUnpaidTaxReminderSent" = true
WHERE "year" != 2025;
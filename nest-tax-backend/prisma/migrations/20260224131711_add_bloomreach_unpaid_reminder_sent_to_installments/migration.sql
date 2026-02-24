-- CreateEnum
CREATE TYPE "UnpaidReminderSent" AS ENUM ('NONE', 'BEFORE_DUE', 'AFTER_DUE', 'BOTH');

-- AlterTable
ALTER TABLE "TaxInstallment" ADD COLUMN     "bloomreachUnpaidReminderSent" "UnpaidReminderSent" NOT NULL DEFAULT 'NONE';

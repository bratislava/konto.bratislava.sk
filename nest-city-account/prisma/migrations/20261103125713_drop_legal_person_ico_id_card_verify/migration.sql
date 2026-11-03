/*
  Warnings:

  - You are about to drop the `LegalPersonIcoIdCardVerify` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LegalPersonIcoIdCardVerify" DROP CONSTRAINT "LegalPersonIcoIdCardVerify_legalPersonId_fkey";

-- DropTable
DROP TABLE "LegalPersonIcoIdCardVerify";

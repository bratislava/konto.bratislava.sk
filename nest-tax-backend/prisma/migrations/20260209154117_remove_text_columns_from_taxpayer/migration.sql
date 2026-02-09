/*
  Warnings:

  - You are about to drop the column `nameTxt` on the `TaxPayer` table. All the data in the column will be lost.
  - You are about to drop the column `permanentResidenceStreetTxt` on the `TaxPayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaxPayer" DROP COLUMN "nameTxt",
DROP COLUMN "permanentResidenceStreetTxt";

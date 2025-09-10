/*
  Warnings:

  - You are about to drop the column `removeIfNotInCityAccountMigrated` on the `TaxPayer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TaxPayer" DROP COLUMN "removeIfNotInCityAccountMigrated";

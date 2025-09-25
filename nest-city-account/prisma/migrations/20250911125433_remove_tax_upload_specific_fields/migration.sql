/*
  Warnings:

  - You are about to drop the column `lastTaxBackendUploadTry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastTaxYear` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "lastTaxBackendUploadTry",
DROP COLUMN "lastTaxYear";

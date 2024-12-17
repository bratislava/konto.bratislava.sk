/*
  Warnings:

  - You are about to drop the column `isInTaxBackend` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isInTaxBackend",
ADD COLUMN     "lastTaxYear" INTEGER;

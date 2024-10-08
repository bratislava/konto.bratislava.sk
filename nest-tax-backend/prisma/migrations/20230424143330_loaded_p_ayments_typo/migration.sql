/*
  Warnings:

  - You are about to drop the column `loudedPayments` on the `LoadingPaymentsFromNoris` table. All the data in the column will be lost.
  - Added the required column `loadedPayments` to the `LoadingPaymentsFromNoris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoadingPaymentsFromNoris" DROP COLUMN "loudedPayments",
ADD COLUMN     "loadedPayments" INTEGER NOT NULL;

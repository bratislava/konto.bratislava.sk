/*
  Warnings:

  - You are about to drop the column `loadingDate` on the `LoadingPaymentsFromNoris` table. All the data in the column will be lost.
  - Added the required column `alreadPayedPayments` to the `LoadingPaymentsFromNoris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loadingDateFrom` to the `LoadingPaymentsFromNoris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loadingDateTo` to the `LoadingPaymentsFromNoris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoadingPaymentsFromNoris" DROP COLUMN "loadingDate",
ADD COLUMN     "alreadPayedPayments" INTEGER NOT NULL,
ADD COLUMN     "errorBirthNumbers" TEXT[],
ADD COLUMN     "loadingDateFrom" DATE NOT NULL,
ADD COLUMN     "loadingDateTo" DATE NOT NULL,
ADD COLUMN     "norisInconsistencyBirthNumbers" TEXT[];

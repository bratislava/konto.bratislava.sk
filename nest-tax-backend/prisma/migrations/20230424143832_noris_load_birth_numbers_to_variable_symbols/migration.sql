/*
  Warnings:

  - You are about to drop the column `errorBirthNumbers` on the `LoadingPaymentsFromNoris` table. All the data in the column will be lost.
  - You are about to drop the column `norisInconsistencyBirthNumbers` on the `LoadingPaymentsFromNoris` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LoadingPaymentsFromNoris" DROP COLUMN "errorBirthNumbers",
DROP COLUMN "norisInconsistencyBirthNumbers",
ADD COLUMN     "errorVariableSymbols" TEXT[],
ADD COLUMN     "norisInconsistencyVariableSymbols" TEXT[];
